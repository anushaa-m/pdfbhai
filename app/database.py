import os
import uuid
from sqlalchemy import create_engine, Column, String, Integer, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mcq_app.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def new_id() -> str:
    return str(uuid.uuid4())


class PDFDocument(Base):
    __tablename__ = "pdf_documents"

    id = Column(String, primary_key=True, default=new_id)
    filename = Column(String, nullable=False)
    num_pages = Column(Integer, default=0)

    chunks = relationship("PDFChunk", back_populates="pdf", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="pdf", cascade="all, delete-orphan")


class PDFChunk(Base):
    __tablename__ = "pdf_chunks"

    id = Column(String, primary_key=True, default=new_id)
    pdf_id = Column(String, ForeignKey("pdf_documents.id"))
    page = Column(Integer)
    text = Column(Text)
    vector_index = Column(Integer)  # position in the FAISS index

    pdf = relationship("PDFDocument", back_populates="chunks")


class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=new_id)
    pdf_id = Column(String, ForeignKey("pdf_documents.id"))
    source_chunk = Column(String)
    concept = Column(String)
    question_text = Column(Text)
    option_a = Column(Text)
    option_b = Column(Text)
    option_c = Column(Text)
    option_d = Column(Text)
    answer = Column(String)  # "A" | "B" | "C" | "D"
    difficulty = Column(String)  # "easy" | "medium" | "hard"
    explanation = Column(Text)
    source_pages = Column(String)  # comma-separated page numbers

    pdf = relationship("PDFDocument", back_populates="questions")


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
