from docx import Document

# Open the document
doc = Document(r'C:\Users\USER\CascadeProjects\GUARDBULLDOG\Chapter_Four_CORRECTED.docx')

# Track changes made
changes_made = []

# Go through all paragraphs and fix the errors
for i, para in enumerate(doc.paragraphs):
    original_text = para.text
    
    # Fix Error #1: Change "Yvonne Caughman" references from "son" to "brother"
    # Line 20: "her experience as mother and caregiver of her son with autism"
    if "Yvonne Caughman provided a unique parent perspective, sharing her experience as mother and caregiver of her son with autism" in para.text:
        para.text = para.text.replace(
            "Yvonne Caughman provided a unique parent perspective, sharing her experience as mother and caregiver of her son with autism",
            "Yvonne Caughman provided a unique sibling perspective, sharing her experience as sister and roommate of her brother with autism"
        )
        para.text = para.text.replace(
            "how parents often serve as informal advocates",
            "how siblings often serve as informal advocates"
        )
        para.text = para.text.replace(
            "navigating city churches with her son",
            "navigating city churches with her brother"
        )
        changes_made.append(f"Paragraph {i}: Fixed Yvonne Caughman from 'son' to 'brother' and 'mother/parent' to 'sibling/sister'")
    
    # Fix "Ms. Caughman's observation about her son's spiritual gifts"
    if "Ms. Caughman's observation about her son's spiritual gifts" in para.text:
        para.text = para.text.replace(
            "Ms. Caughman's observation about her son's spiritual gifts",
            "Ms. Caughman's observation about her brother's spiritual gifts"
        )
        changes_made.append(f"Paragraph {i}: Fixed 'her son's spiritual gifts' to 'her brother's spiritual gifts'")
    
    # Fix "Yvonne Caughman shared how her family collaborated with church leadership around her son's needs"
    if "Yvonne Caughman shared how her family collaborated with church leadership around her son's needs" in para.text:
        para.text = para.text.replace(
            "around her son's needs",
            "around her brother's needs"
        )
        changes_made.append(f"Paragraph {i}: Fixed 'her son's needs' to 'her brother's needs'")
    
    # Fix any other references to "Ms. Caughman" and "her son"
    if "Ms. Caughman" in para.text and "her son" in para.text:
        para.text = para.text.replace("her son", "her brother")
        changes_made.append(f"Paragraph {i}: Fixed 'her son' to 'her brother' in Ms. Caughman context")

# Save the corrected document
doc.save(r'C:\Users\USER\CascadeProjects\GUARDBULLDOG\Chapter_Four_CORRECTED.docx')

# Print changes made
print("=" * 60)
print("CORRECTIONS MADE:")
print("=" * 60)
for change in changes_made:
    print(f"- {change}")
print("=" * 60)
print(f"Total changes: {len(changes_made)}")
print("\nCorrected file saved as: Chapter_Four_CORRECTED.docx")
