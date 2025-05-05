## Overview

ESMFinder is a protein similarity search tool that leverages embeddings from the ESMC 300M model. It allows users to input a protein sequence and retrieve the top-k most similar proteins from the UniProtKB/Swiss-Prot database, based on the cosine similarity between their ESM embeddings. You can view this project [here](https://storage.googleapis.com/esmfinder/index.html)

### Technologies Used

- **ESMC 300M Model**: Used for generating embeddings of protein sequences
- **Python + NumPy/Pandas**: Backend data processing and similarity scoring
- **FastAPI**: Lightweight HTTP wrapper for serving the model in production
- **Google Cloud Run**: Cloud hosting for the backend API
- **Google Cloud Storage**: Static hosting for the frontend
- **React**: Frontend library for building the user interface
- **Material UI (MUI)**: UI component library for layout and styling
- **Docker**: Containerization for the backend

## License and Attribution

This project integrates the ESMC 300M Open Model provided by [EvolutionaryScale](https://www.evolutionaryscale.ai).

- **Built with ESM**
- Some outputs may be labeled as **"Generated with ESM"**
- This software includes components licensed under the [Cambrian Open License Agreement (COLA)](https://www.evolutionaryscale.ai/policies/cambrian-open-license-agreement)