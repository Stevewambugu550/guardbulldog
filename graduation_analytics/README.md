# 🎓 Graduation Year Analytics System

Python-based system for analyzing graduation years (2009-2024) with student metrics and database connectivity.

## Features

- 📊 Year-over-year graduation analysis
- 📈 Statistical metrics and trends
- 🔍 Student identification by multiple criteria
- 💾 Database connectivity (PostgreSQL/MySQL/SQLite)
- 📉 Data visualization
- 📄 Export reports (CSV, PDF, Excel)

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Configure database
cp config.example.py config.py
# Edit config.py with your database credentials

# Run analysis
python analyze_graduations.py

# Start web interface
python app.py
```

## Metrics Calculated

- Total graduates per year
- Year-over-year growth rate
- Average time to graduation
- Retention rates
- Cohort analysis
- Department/major distribution
- GPA trends
- And more...

## Database Schema

See `schema.sql` for the expected database structure.
