-- SkillOS 数据库 DDL 草案（PostgreSQL）

create table if not exists org_unit (
  id bigserial primary key,
  org_code varchar(64) not null unique,
  org_name varchar(128) not null,
  org_level varchar(32) not null,
  parent_id bigint references org_unit(id),
  created_at timestamptz not null default now()
);

create table if not exists sys_user (
  id bigserial primary key,
  user_code varchar(64) not null unique,
  user_name varchar(64) not null,
  email varchar(128),
  org_id bigint references org_unit(id),
  created_at timestamptz not null default now()
);

create table if not exists role_def (
  id bigserial primary key,
  role_code varchar(64) not null unique,
  role_name varchar(64) not null,
  created_at timestamptz not null default now()
);

create table if not exists user_role (
  id bigserial primary key,
  user_id bigint not null references sys_user(id),
  role_id bigint not null references role_def(id),
  unique(user_id, role_id)
);

create table if not exists skill_definition (
  id bigserial primary key,
  skill_code varchar(16) not null unique,
  skill_name varchar(128) not null,
  domain_no int not null,
  module_no int not null,
  goal text,
  input_schema jsonb not null default '{}'::jsonb,
  output_schema jsonb not null default '{}'::jsonb,
  kpi_schema jsonb not null default '{}'::jsonb,
  risk_schema jsonb not null default '{}'::jsonb,
  status varchar(16) not null default 'active',
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists skill_dependency (
  id bigserial primary key,
  skill_code varchar(16) not null references skill_definition(skill_code),
  upstream_skill_code varchar(16) not null references skill_definition(skill_code),
  unique(skill_code, upstream_skill_code)
);

create table if not exists flow_definition (
  id bigserial primary key,
  flow_code varchar(64) not null unique,
  flow_name varchar(128) not null,
  skill_code varchar(16) not null references skill_definition(skill_code),
  flow_json jsonb not null,
  sla_policy jsonb not null default '{}'::jsonb,
  escalation_policy jsonb not null default '{}'::jsonb,
  status varchar(16) not null default 'active',
  version int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists skill_instance (
  id bigserial primary key,
  instance_no varchar(64) not null unique,
  skill_code varchar(16) not null references skill_definition(skill_code),
  flow_code varchar(64) not null references flow_definition(flow_code),
  org_id bigint not null references org_unit(id),
  trigger_source varchar(64),
  status varchar(16) not null,
  owner_user_id bigint references sys_user(id),
  start_at timestamptz not null default now(),
  due_at timestamptz,
  end_at timestamptz,
  extra jsonb not null default '{}'::jsonb
);

create table if not exists task_item (
  id bigserial primary key,
  task_no varchar(64) not null unique,
  instance_id bigint not null references skill_instance(id),
  node_key varchar(64) not null,
  task_name varchar(128) not null,
  assignee_user_id bigint references sys_user(id),
  priority varchar(16) not null default 'medium',
  status varchar(16) not null default 'todo',
  deadline timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  comments text
);

create table if not exists deliverable (
  id bigserial primary key,
  deliverable_no varchar(64) not null unique,
  instance_id bigint not null references skill_instance(id),
  template_code varchar(64) not null,
  file_uri text,
  file_name varchar(256),
  version int not null default 1,
  approved_by bigint references sys_user(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists kpi_record (
  id bigserial primary key,
  period_key varchar(16) not null,
  org_id bigint not null references org_unit(id),
  skill_code varchar(16) not null references skill_definition(skill_code),
  kpi_code varchar(64) not null,
  target_value numeric(20,4),
  actual_value numeric(20,4),
  source varchar(64),
  created_at timestamptz not null default now(),
  unique(period_key, org_id, skill_code, kpi_code)
);

create table if not exists risk_issue (
  id bigserial primary key,
  instance_id bigint not null references skill_instance(id),
  risk_level varchar(16) not null,
  risk_desc text not null,
  mitigation text,
  owner_user_id bigint references sys_user(id),
  status varchar(16) not null default 'open',
  due_at timestamptz,
  closed_at timestamptz
);

create table if not exists audit_log (
  id bigserial primary key,
  biz_type varchar(32) not null,
  biz_id varchar(64) not null,
  action varchar(64) not null,
  operator_user_id bigint references sys_user(id),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_instance_skill on skill_instance(skill_code);
create index if not exists idx_instance_org on skill_instance(org_id);
create index if not exists idx_task_assignee on task_item(assignee_user_id, status);
create index if not exists idx_kpi_period_org on kpi_record(period_key, org_id);
create index if not exists idx_audit_biz on audit_log(biz_type, biz_id);
