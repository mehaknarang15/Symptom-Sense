import numpy as np
import pandas as pd
import re

def search_medicine(user_input):
    df = pd.read_csv("medicine_data_cleaned.csv")

    if not user_input.strip():  
        return {"Error": "Input is empty."}
    
    pattern = re.escape(user_input.strip())

    matched_rows = df[df['name'].str.contains(pattern, flags=re.IGNORECASE, na=False)]
    
    if matched_rows.empty:
        return {"Error": "No matching medicine found."}
    
    results = {}
    for _, row in matched_rows.iterrows():
        results[row["name"]] = {
            "Substitutes": row.get("substitute_merged", "N/A"),
            "Uses": row.get("use_merged", "N/A"),
            "Side Effects": row.get("sideEffect_merged", "N/A")
        }
        
        # Convert NaN values to "N/A"
        for key in results[row["name"]]:
            if pd.isna(results[row["name"]][key]):
                results[row["name"]][key] = "N/A"

    return results
