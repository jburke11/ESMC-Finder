from esm.models.esmc import ESMC
from esm.sdk.api import ESMProtein, LogitsConfig
import numpy as np

logit_config = LogitsConfig(sequence=True, return_embeddings=True)
client = ESMC.from_pretrained("esmc_300m")

def embed_sequence(sequence: str) -> np.ndarray:
    protein = ESMProtein(sequence=sequence)
    protein_tensor = client.encode(protein)
    logits_output = client.logits(
        protein_tensor, LogitsConfig(sequence=True, return_embeddings=True)
    )
    return logits_output.embeddings[0].mean(axis=0).numpy()

def cosine_similarity(query_vec: np.ndarray, db_vecs: np.ndarray) -> np.ndarray:
    db_vecs_norm = db_vecs / (np.linalg.norm(db_vecs, axis=1, keepdims=True))
    query_norm = query_vec / (np.linalg.norm(query_vec))
    return db_vecs_norm @ query_norm

def get_top_k_similar(query_seq: str, db_embeddings: np.ndarray, k=5) -> tuple:
    query_emb = embed_sequence(query_seq)
    scores = cosine_similarity(query_emb, db_embeddings)
    top_k = np.argsort(scores)[::-1][:k]
    return top_k, scores[top_k]

def jaccard_similarity(set1, set2):
    if not set1 or not set2:
        return 0.0
    return len(set1 & set2) / len(set1 | set2)

def evaluate_jaccard(query_id, top_ids, pfam_arr):
    sims = [jaccard_similarity(set(pfam_arr[query_id]), set(pfam_arr["Pfam"][pid])) for pid in top_ids]
    return sum(sims) / len(sims) if sims else 0.0

