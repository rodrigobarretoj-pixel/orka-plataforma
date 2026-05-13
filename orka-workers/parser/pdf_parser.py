# parser/pdf_parser.py
"""
Parser de fichas PDF para ORKA.
Usa extração de texto nativa (PyMuPDF/pdfplumber) com fallback OCR (PaddleOCR).
"""
import io
from typing import Any

def parse_pdf(file_bytes: bytes, filename: str) -> dict[str, Any]:
    """
    Extrai texto e estrutura de um PDF.
    Tenta extração nativa primeiro; usa PaddleOCR como fallback.
    """
    raw_text = ""
    pages_data = []
    method = "native"

    try:
        # Tentativa 1: extração nativa via pdfplumber
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for i, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text() or ""
                tables = page.extract_tables() or []
                pages_data.append({
                    "page": i,
                    "text": page_text,
                    "tables": tables,
                })
                raw_text += f"\n\n--- PÁGINA {i} ---\n\n{page_text}"

        # Se extração nativa não retornou texto útil, tenta OCR
        if len(raw_text.strip()) < 50:
            raise ValueError("Texto insuficiente via extração nativa")

    except Exception as native_error:
        method = "ocr"
        try:
            # Fallback: PaddleOCR
            from paddleocr import PaddleOCR
            ocr = PaddleOCR(use_angle_cls=True, lang='pt', show_log=False)
            result = ocr.ocr(file_bytes, cls=True)
            if result:
                lines = []
                for line in result[0]:
                    if line[1][0]:
                        lines.append(line[1][0])
                raw_text = "\n".join(lines)
                pages_data = [{"page": 1, "text": raw_text, "tables": []}]
        except Exception as ocr_error:
            return {
                "filename": filename,
                "success": False,
                "error": f"Native: {native_error} | OCR: {ocr_error}",
                "raw_text": "",
                "pages": [],
                "method": "failed"
            }

    return {
        "filename": filename,
        "success": True,
        "method": method,
        "page_count": len(pages_data),
        "pages": pages_data,
        "raw_text": raw_text.strip(),
    }
