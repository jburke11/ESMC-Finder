from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.similarity import get_top_k_similar
from app.utils import load_embeddings, load_metadata, compute_sequence_identity

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

embeddings = load_embeddings("app/data/protein_embeddings.npy")
uniprot_metadata = load_metadata("app/data/uniprot_metadata.parquet")

class SequenceQuery(BaseModel):
    sequence: str
    top_k: int = 5

class Recommendation(BaseModel):
    id: str
    similarity: float
    pfam: list[str]
    pfam_links: list[str]

@app.get("/")
def recommend_sequence():
    return {"hello": "world"}

@app.post("/recommend-sequence")
def recommend_sequence(query: SequenceQuery):
    if not query.sequence:
        raise HTTPException(status_code=400, detail="Missing protein sequence")
    if len(query.sequence) > 1000:
        raise HTTPException(status_code=400, detail="Protein sequence too long (max 1000 amino acids)")
    if query.top_k <= 0:
        raise HTTPException(status_code=400, detail="top_k must be a positive integer")
    if query.top_k > 100:
        raise HTTPException(status_code=400, detail="top_k must not exceed 100")
    similar_prots, scores = get_top_k_similar(query.sequence, embeddings, query.top_k)
    if len(similar_prots) == 0:
        raise HTTPException(status_code=404, detail="No similar sequences found")
    results = []
    for i, embedding_index in enumerate(similar_prots):
        prot_id = uniprot_metadata["Entry Name"][embedding_index]
        sim_score = float(scores[i])
        # Fetch Pfam terms from metadata
        pfam_terms = uniprot_metadata["Pfam"][embedding_index]
        pfam_links = [f"https://www.ebi.ac.uk/interpro/entry/pfam/{pfam}" for pfam in pfam_terms] if pfam_terms else []
        results.append({
            "id": prot_id,
            "id_link": f"https://www.uniprot.org/uniprot/{prot_id}/entry",
            "similarity": sim_score,
            "identity": compute_sequence_identity(query.sequence, uniprot_metadata['Sequence'][embedding_index]),
            "pfam": pfam_terms if pfam_terms else [],
            "pfam_links": pfam_links,
        })
    return {"results": results}