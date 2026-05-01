ALTER TABLE tasks
  ADD COLUMN category TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN ('work', 'personal', 'family', 'health', 'other'));

CREATE INDEX tasks_user_id_category_idx ON tasks(user_id, category);
