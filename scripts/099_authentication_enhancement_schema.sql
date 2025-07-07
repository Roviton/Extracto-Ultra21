-- Company Invitations Table
CREATE TABLE IF NOT EXISTS company_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('dispatcher', 'admin')),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Driver-Dispatcher Assignments Table
CREATE TABLE IF NOT EXISTS driver_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  dispatcher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique driver-dispatcher pairs
  UNIQUE(driver_id, dispatcher_id)
);

-- RPM Targets Table
CREATE TABLE IF NOT EXISTS rpm_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  target_rpm DECIMAL(5,2) NOT NULL CHECK (target_rpm > 0),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure period_end is after period_start
  CHECK (period_end > period_start)
);

-- Admin Comments Table (Enhanced)
CREATE TABLE IF NOT EXISTS admin_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id),
  comment TEXT NOT NULL,
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  dispatcher_notified BOOLEAN DEFAULT FALSE,
  dispatcher_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Load Flags Table (for RPM and other automated flagging)
CREATE TABLE IF NOT EXISTS load_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  flag_type VARCHAR(50) NOT NULL, -- 'low_rpm', 'delayed', 'attention_required', etc.
  flag_reason TEXT,
  severity VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id), -- NULL for system-generated flags
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_invitations_token ON company_invitations(token);
CREATE INDEX IF NOT EXISTS idx_company_invitations_email ON company_invitations(email);
CREATE INDEX IF NOT EXISTS idx_company_invitations_company_id ON company_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_driver_id ON driver_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_dispatcher_id ON driver_assignments(dispatcher_id);
CREATE INDEX IF NOT EXISTS idx_rpm_targets_company_id ON rpm_targets(company_id);
CREATE INDEX IF NOT EXISTS idx_admin_comments_load_id ON admin_comments(load_id);
CREATE INDEX IF NOT EXISTS idx_admin_comments_company_id ON admin_comments(company_id);
CREATE INDEX IF NOT EXISTS idx_load_flags_load_id ON load_flags(load_id);
CREATE INDEX IF NOT EXISTS idx_load_flags_active ON load_flags(is_active) WHERE is_active = TRUE;

-- RLS Policies
ALTER TABLE company_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpm_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_flags ENABLE ROW LEVEL SECURITY;

-- Company Invitations Policies
CREATE POLICY "Users can view invitations for their company" ON company_invitations
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage invitations for their company" ON company_invitations
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Driver Assignments Policies
CREATE POLICY "Users can view driver assignments for their company" ON driver_assignments
  FOR SELECT USING (
    dispatcher_id IN (SELECT id FROM users WHERE company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    ))
  );

CREATE POLICY "Admins can manage driver assignments for their company" ON driver_assignments
  FOR ALL USING (
    dispatcher_id IN (
      SELECT id FROM users 
      WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- RPM Targets Policies
CREATE POLICY "Users can view RPM targets for their company" ON rpm_targets
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage RPM targets for their company" ON rpm_targets
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin Comments Policies
CREATE POLICY "Users can view admin comments for their company loads" ON admin_comments
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage admin comments for their company" ON admin_comments
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Load Flags Policies
CREATE POLICY "Users can view load flags for their company loads" ON load_flags
  FOR SELECT USING (
    load_id IN (
      SELECT id FROM loads WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage load flags for their company loads" ON load_flags
  FOR ALL USING (
    load_id IN (
      SELECT id FROM loads WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );
