from typing import List, Optional
from pydantic import BaseModel, Field


class MetaInfo(BaseModel):
    parser_version: str = "1.0.0"
    file_type: str
    requires_manual_entry: bool = False
    reason: Optional[str] = None


class LocationInfo(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None


class EducationItem(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    grade: Optional[str] = None
    location: Optional[str] = None


class ExperienceItem(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration: Optional[str] = None
    location: Optional[str] = None
    description: List[str] = Field(default_factory=list)


class ProjectItem(BaseModel):
    title: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    description: List[str] = Field(default_factory=list)


class CertificationItem(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    date: Optional[str] = None


class CandidateInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    location: LocationInfo = Field(default_factory=LocationInfo)
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)
    experience: List[ExperienceItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    certifications: List[CertificationItem] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)


class ParseResponse(BaseModel):
    success: bool = True
    meta: MetaInfo
    candidate: CandidateInfo


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
