# ORKA Workers — FastAPI Backend
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os
from dotenv import load_dotenv

from parser.pptx_parser import parse_pptx
from parser.pdf_parser import parse_pdf
from ai.interpreter import interpret_ficha

load_dotenv()

app = FastAPI(
    title="ORKA Workers API",
    description="Processamento pesado: parsing de fichas, OCR, IA",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", os.getenv("FRONTEND_URL", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ──────────────────────────────────────────────────────────────────

class ParseResult(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    raw_text: Optional[str] = None


class FichaInterpretation(BaseModel):
    cliente: Optional[str] = None
    campanha: Optional[str] = None
    locutor: Optional[str] = None
    midia: Optional[str] = None
    prazo: Optional[str] = None
    prioridade: Optional[str] = None
    duracao: Optional[str] = None
    valor: Optional[float] = None
    observacoes: Optional[str] = None
    textos: Optional[list[str]] = None


# ── Routes ──────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": "ORKA Workers", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}


@app.post("/parse/pptx", response_model=ParseResult, tags=["Parser"])
async def parse_pptx_file(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """Parse um arquivo PPTX e extrai dados estruturados da ficha."""
    if not file.filename.endswith(('.pptx', '.ppt')):
        raise HTTPException(status_code=400, detail="Arquivo deve ser .pptx ou .ppt")

    try:
        contents = await file.read()
        result = parse_pptx(contents, file.filename)
        return ParseResult(success=True, data=result, raw_text=result.get("raw_text"))
    except Exception as e:
        return ParseResult(success=False, error=str(e))


@app.post("/parse/pdf", response_model=ParseResult, tags=["Parser"])
async def parse_pdf_file(file: UploadFile = File(...)):
    """Parse um arquivo PDF usando OCR."""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Arquivo deve ser .pdf")

    try:
        contents = await file.read()
        result = parse_pdf(contents, file.filename)
        return ParseResult(success=True, data=result, raw_text=result.get("raw_text"))
    except Exception as e:
        return ParseResult(success=False, error=str(e))


@app.post("/interpret", response_model=FichaInterpretation, tags=["AI"])
async def interpret_ficha_endpoint(raw_text: str):
    """Usa IA para interpretar texto bruto de ficha e retornar JSON operacional."""
    try:
        result = await interpret_ficha(raw_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/process/full", tags=["Pipeline"])
async def process_full_pipeline(file: UploadFile = File(...)):
    """
    Pipeline completo: upload → parse → IA → JSON operacional.
    Usado para criação automática de cards no Kanban.
    """
    filename = file.filename.lower()
    contents = await file.read()

    try:
        # Step 1: Parse
        if filename.endswith(('.pptx', '.ppt')):
            parsed = parse_pptx(contents, file.filename)
        elif filename.endswith('.pdf'):
            parsed = parse_pdf(contents, file.filename)
        else:
            raise HTTPException(status_code=400, detail="Formato não suportado. Use .pptx, .ppt ou .pdf")

        raw_text = parsed.get("raw_text", "")

        # Step 2: IA interpretation
        if raw_text and len(raw_text) > 10:
            interpreted = await interpret_ficha(raw_text)
        else:
            interpreted = {}

        return {
            "success": True,
            "parsed": parsed,
            "interpreted": interpreted,
            "filename": file.filename,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no pipeline: {str(e)}")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
