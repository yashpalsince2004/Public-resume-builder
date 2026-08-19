import os
from fastapi import FastAPI, UploadFile, File, status
from fastapi.responses import JSONResponse
from parser.models import (
    ParseResponse,
    MetaInfo,
    CandidateInfo,
    ErrorResponse,
    ErrorDetail,
)
from parser.pdf_parser import extract_text_from_pdf
from parser.docx_parser import extract_text_from_docx
from parser.text_cleaner import clean_text
from parser.extractor import extract_candidate_info

app = FastAPI(
    title="Deterministic Resume Parser Service",
    version="1.0.0",
    description="Zero-cost, local, deterministic PDF/DOCX resume ingestion and parsing API.",
)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "resume_parser", "version": "1.0.0"}


@app.post(
    "/parse",
    response_model=ParseResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def parse_resume(file: UploadFile = File(...)):
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()

    # Step 1 — File Detection & Validation
    if ext not in [".pdf", ".docx"]:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=ErrorResponse(
                success=False,
                error=ErrorDetail(
                    code="UNSUPPORTED_FILE_TYPE",
                    message="Only PDF and DOCX files are supported.",
                ),
            ).model_dump(),
        )

    try:
        contents = await file.read()
        if not contents:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content=ErrorResponse(
                    success=False,
                    error=ErrorDetail(
                        code="PARSE_FAILED",
                        message="Unable to extract text from empty document.",
                    ),
                ).model_dump(),
            )

        file_type = "pdf" if ext == ".pdf" else "docx"
        raw_text = ""
        is_scanned = False
        reason = ""

        # Step 2 & 3 — Extraction
        if ext == ".pdf":
            raw_text, is_scanned, reason = extract_text_from_pdf(contents)
        else:
            raw_text = extract_text_from_docx(contents)

        # Scanned / Low Confidence PDF Handling
        if is_scanned:
            return ParseResponse(
                success=True,
                meta=MetaInfo(
                    parser_version="1.0.0",
                    file_type="pdf",
                    requires_manual_entry=True,
                    reason=reason or "scanned_pdf",
                ),
                candidate=CandidateInfo(),
            )

        # Step 4 — Text Normalization
        cleaned_text = clean_text(raw_text)

        # Step 5 to 13 — Field & Section Extraction
        candidate_data = extract_candidate_info(cleaned_text)

        return ParseResponse(
            success=True,
            meta=MetaInfo(
                parser_version="1.0.0",
                file_type=file_type,
                requires_manual_entry=False,
                reason=None,
            ),
            candidate=candidate_data,
        )

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=ErrorResponse(
                success=False,
                error=ErrorDetail(
                    code="PARSE_FAILED",
                    message="Unable to extract text from the uploaded document.",
                ),
            ).model_dump(),
        )
