import numpy as np
import pandas as pd
from Bio import pairwise2
from Bio.Seq import Seq

def load_embeddings(file_path: str) -> np.ndarray:
    """
    Load embeddings from a .npy file.

    Args:
        file_path (str): Path to the .npy file containing embeddings.

    Returns:
        np.ndarray: Loaded embeddings.
    """
    return np.load(file_path)

def load_metadata(file_path: str) -> pd.DataFrame:
    """
    Load IDs and metadata from a parquet file.

    Args:
        file_path (str): Path to the parquet file containing IDs and metadata.

    Returns:
        pd.DataFrame: DataFrame containing IDs and metadata.
    """
    return pd.read_parquet(file_path)

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