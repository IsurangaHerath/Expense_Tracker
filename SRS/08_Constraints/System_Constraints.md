# 8 System Constraints

## 8.1 Development Constraints

| Constraint | Description |
|------------|-------------|
| Team Size | Maximum 7 members, 6 weeks development time |
| Budget | No external budget |
| Tools | Must use open-source/free tools (React, Express, SQLite) |

## 8.2 Technical Constraints

| Constraint | Impact |
|------------|--------|
| SQLite Database | No server clustering, file-based storage only |
| No External APIs | No bank integration, no third-party services |
| Single Tenant | Per-user data isolation at application level |

## 8.3 Deployment Constraints

| Constraint | Description |
|------------|-------------|
| No Docker | Local development and testing only |
| No Cloud | No Heroku/AWS deployment |
| Manual DB Setup | Users must provide database file location |

## 8.4 Code Constraints

| Constraint | Requirement |
|------------|-------------|
| ESLint | Required for code quality |
| Prettier | Code formatting enforced |
| Commit Convention | Conventional Commits required |

## 8.5 Project Management Constraints

| Constraint | Description |
|------------|-------------|
| Semester Timeline | Must complete by end of semester |
| GitHub Workflow | Must follow branching model |
| Pull Requests | Required for all feature merges |