# ai/interpreter.py
"""
Interpretação inteligente de fichas via IA para ORKA.
Transforma texto bruto extraído de PPT/PDF em JSON operacional estruturado.
Suporta OpenAI GPT-4o e Anthropic Claude.
"""
import os
import json
import re
from typing import Optional

SYSTEM_PROMPT = """
Você é um assistente especializado em produção comercial para TV, rádio e digital.
Sua função é analisar textos extraídos de fichas de produção (briefings) e extrair informações operacionais estruturadas.

Retorne APENAS um JSON válido com os seguintes campos (use null se não encontrar):
{
  "cliente": "nome do cliente/anunciante",
  "campanha": "nome ou título da campanha",
  "locutor": "nome do locutor indicado",
  "midia": "tipo de mídia (TV, Rádio, Digital, etc)",
  "prazo": "data de entrega no formato ISO 8601 (YYYY-MM-DD) se possível",
  "prioridade": "urgente | alta | media | baixa",
  "duracao": "duração do comercial (ex: 30s, 60s, 15s)",
  "valor": número ou null,
  "observacoes": "observações importantes resumidas",
  "textos": ["array com os textos do roteiro se houver"]
}

Seja preciso. Não invente informações. Se não encontrar, use null.
"""

async def interpret_ficha(raw_text: str) -> dict:
    """
    Interpreta texto bruto de ficha usando OpenAI ou Claude.
    Tenta OpenAI primeiro, com fallback para Claude.
    """
    if not raw_text or len(raw_text.strip()) < 10:
        return {}

    # Tenta OpenAI
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        try:
            return await _interpret_openai(raw_text, openai_key)
        except Exception as e:
            print(f"[ORKA/AI] OpenAI falhou: {e}")

    # Fallback: Anthropic Claude
    claude_key = os.getenv("ANTHROPIC_API_KEY")
    if claude_key:
        try:
            return await _interpret_claude(raw_text, claude_key)
        except Exception as e:
            print(f"[ORKA/AI] Claude falhou: {e}")

    # Sem chave configurada
    print("[ORKA/AI] Nenhuma chave de IA configurada. Configure OPENAI_API_KEY ou ANTHROPIC_API_KEY.")
    return {}


async def _interpret_openai(raw_text: str, api_key: str) -> dict:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=api_key)

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Ficha para análise:\n\n{raw_text[:6000]}"}
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
        max_tokens=1000,
    )

    content = response.choices[0].message.content
    return json.loads(content)


async def _interpret_claude(raw_text: str, api_key: str) -> dict:
    import anthropic
    client = anthropic.AsyncAnthropic(api_key=api_key)

    message = await client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        messages=[
            {
                "role": "user",
                "content": f"{SYSTEM_PROMPT}\n\nFicha para análise:\n\n{raw_text[:6000]}"
            }
        ],
    )

    content = message.content[0].text
    # Extract JSON from Claude response
    json_match = re.search(r'\{.*\}', content, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())
    return json.loads(content)
