import numpy as np
import pandas as pd
from Bio import pairwise2

def load_embeddings(file_path: str) -> np.ndarray:
    """
    Load embeddings from a memmapped file.

    Args:
        file_path (str): Path to the memmapped file containing embeddings.

    Returns:
        np.ndarray: Loaded embeddings.
    """
    return np.memmap(file_path, dtype="float32", mode='r', shape=(572970, 960))

def load_metadata(file_path: str) -> pd.DataFrame:
    """
    Load IDs and metadata from a parquet file.

    Args:
        file_path (str): Path to the parquet file containing IDs and metadata.

    Returns:
        pd.DataFrame: DataFrame containing IDs and metadata.
    """
    return pd.read_parquet(file_path, columns=["Entry Name", "Pfam"], engine="pyarrow")

def get_uniprot_sequences(entry_names: list) -> list:
    return pd.read_parquet("app/data/uniprot_metadata.parquet", filters=[("Entry Name", "in", entry_names)], engine="pyarrow")

def compute_sequence_identity(query_seq: str, target_seq: str) -> float:
    """
    Compute the sequence identity between two sequences.

    Args:
        seq1 (str): First protein sequence.
        seq2 (str): Second protein sequence.

    Returns:
        float: Sequence identity as a percentage.
    """
    # Compute identity percentage
    alignments = pairwise2.align.globalxx(query_seq, target_seq, one_alignment_only=True)
    aln1, aln2, score, start, end = alignments[0]
    matches = sum(res1 == res2 for res1, res2 in zip(aln1, aln2))
    identity = matches / max(len(query_seq), len(target_seq)) * 100
    return round(identity, 2)