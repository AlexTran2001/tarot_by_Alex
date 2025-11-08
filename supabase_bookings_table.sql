-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    type TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);

-- Create index on date for filtering by date
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all bookings (for admin)
CREATE POLICY "Allow authenticated users to read bookings"
    ON bookings
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow anyone to insert bookings (for public booking form)
CREATE POLICY "Allow public to insert bookings"
    ON bookings
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to update bookings
CREATE POLICY "Allow authenticated users to update bookings"
    ON bookings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Allow authenticated users to delete bookings
CREATE POLICY "Allow authenticated users to delete bookings"
    ON bookings
    FOR DELETE
    TO authenticated
    USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to table and columns for documentation
COMMENT ON TABLE bookings IS 'Stores Tarot reading booking requests from customers';
COMMENT ON COLUMN bookings.id IS 'Unique identifier for each booking';
COMMENT ON COLUMN bookings.name IS 'Customer full name';
COMMENT ON COLUMN bookings.email IS 'Customer email address';
COMMENT ON COLUMN bookings.date IS 'Preferred booking date';
COMMENT ON COLUMN bookings.time IS 'Preferred booking time';
COMMENT ON COLUMN bookings.type IS 'Type of Tarot reading service';
COMMENT ON COLUMN bookings.note IS 'Additional notes or special requests from customer';
COMMENT ON COLUMN bookings.created_at IS 'Timestamp when booking was created';
COMMENT ON COLUMN bookings.updated_at IS 'Timestamp when booking was last updated';

