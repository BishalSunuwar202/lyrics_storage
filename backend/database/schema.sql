CREATE TABLE IF NOT EXISTS lyrics (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  writer_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Bhajan', 'Koras')),
  number VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  submitted_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
