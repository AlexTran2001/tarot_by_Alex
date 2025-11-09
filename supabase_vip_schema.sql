-- VIP Users Table - Track VIP status and expiration
CREATE TABLE IF NOT EXISTS vip_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_vip BOOLEAN DEFAULT true,
    vip_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Daily Cards Table - Store daily card readings
CREATE TABLE IF NOT EXISTS daily_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_name TEXT NOT NULL,
    card_image_url TEXT,
    card_meaning TEXT NOT NULL,
    card_description TEXT NOT NULL,
    card_date DATE NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Magazines Table - Store magazine articles
CREATE TABLE IF NOT EXISTS magazines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    author_id UUID REFERENCES auth.users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons Table - Store lessons for VIP users
CREATE TABLE IF NOT EXISTS lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    video_url TEXT,
    image_url TEXT,
    order_number INTEGER NOT NULL,
    lesson_type TEXT NOT NULL DEFAULT 'general',
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Progress Table - Track user progress in lessons and cards
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    card_id UUID REFERENCES daily_cards(id) ON DELETE CASCADE,
    progress_type TEXT NOT NULL, -- 'lesson', 'card', 'magazine'
    completed BOOLEAN DEFAULT false,
    progress_data JSONB, -- Store additional progress data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id, progress_type),
    UNIQUE(user_id, card_id, progress_type)
);

-- User Saved Data Table - Save user account data and history
CREATE TABLE IF NOT EXISTS user_saved_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data_type TEXT NOT NULL, -- 'reading_history', 'favorite_cards', 'notes', etc.
    data_content JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional: data expiration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vip_users_user_id ON vip_users(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_users_expires_at ON vip_users(vip_expires_at);
CREATE INDEX IF NOT EXISTS idx_daily_cards_date ON daily_cards(card_date DESC);
CREATE INDEX IF NOT EXISTS idx_magazines_published_at ON magazines(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(order_number);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_card_id ON user_progress(card_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_data_user_id ON user_saved_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_data_type ON user_saved_data(data_type);

-- Enable Row Level Security (RLS)
ALTER TABLE vip_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazines ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vip_users
CREATE POLICY "Users can view their own VIP status"
    ON vip_users FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage VIP users"
    ON vip_users FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policies for daily_cards (VIP users only)
CREATE POLICY "VIP users can view daily cards"
    ON daily_cards FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM vip_users
            WHERE vip_users.user_id = auth.uid()
            AND vip_users.is_vip = true
            AND (vip_users.vip_expires_at IS NULL OR vip_users.vip_expires_at > NOW())
        )
    );

CREATE POLICY "Admins can manage daily cards"
    ON daily_cards FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policies for magazines (VIP users only)
CREATE POLICY "VIP users can view magazines"
    ON magazines FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM vip_users
            WHERE vip_users.user_id = auth.uid()
            AND vip_users.is_vip = true
            AND (vip_users.vip_expires_at IS NULL OR vip_users.vip_expires_at > NOW())
        )
    );

CREATE POLICY "Admins can manage magazines"
    ON magazines FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policies for lessons (VIP users only)
CREATE POLICY "VIP users can view lessons"
    ON lessons FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM vip_users
            WHERE vip_users.user_id = auth.uid()
            AND vip_users.is_vip = true
            AND (vip_users.vip_expires_at IS NULL OR vip_users.vip_expires_at > NOW())
        )
    );

CREATE POLICY "Admins can manage lessons"
    ON lessons FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policies for user_progress
CREATE POLICY "Users can view their own progress"
    ON user_progress FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress"
    ON user_progress FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_saved_data
CREATE POLICY "Users can view their own saved data"
    ON user_saved_data FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own saved data"
    ON user_saved_data FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Triggers to update updated_at
CREATE TRIGGER update_vip_users_updated_at
    BEFORE UPDATE ON vip_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_cards_updated_at
    BEFORE UPDATE ON daily_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_magazines_updated_at
    BEFORE UPDATE ON magazines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_saved_data_updated_at
    BEFORE UPDATE ON user_saved_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE vip_users IS 'Tracks VIP user status and expiration dates';
COMMENT ON TABLE daily_cards IS 'Daily Tarot card readings for VIP users';
COMMENT ON TABLE magazines IS 'Magazine articles for VIP users';
COMMENT ON TABLE lessons IS 'Lessons and courses for VIP users';
COMMENT ON TABLE user_progress IS 'Tracks user progress in lessons and cards';
COMMENT ON TABLE user_saved_data IS 'Saves user account data and history';

