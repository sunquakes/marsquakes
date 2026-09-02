# MySQL pre-loaded with the JeecgBoot schema.
#
# The base image is the official mysql:8.0 rather than the aliyun mirror the
# upstream template used: the repository rule is official images only, and the
# proxy configured on the Docker daemon already makes docker.io reachable.
#
# The server is 8.0 even though the dump is named ...-mysql-5.7.sql: that 5.7
# records the Navicat *source* server the dump was taken from, not a
# requirement. The dump backtick-quotes every identifier (so 8.0's new reserved
# words cannot bite), contains no NO_AUTO_CREATE_USER, no GRANT ... IDENTIFIED
# BY, no zero-dates and no MyISAM, and mysql-connector-java is already 8.0.27.
# Only deprecation warnings remain -- see the notes below the COPY lines.
#
# The patch version is pinned, and that pin is load bearing. MySQL images are
# Oracle Linux based, but they are NOT exempt from the glibc 2.31 / clone3
# seccomp constraint documented in AGENTS.md: Docker 20.10.8 fails to create
# threads on glibc >= 2.34. Measured on this machine:
#
#   mysql:8.0.36  Oracle Linux 8.9  glibc 2.28  works
#   mysql:8.0.40  Oracle Linux 9.5  glibc 2.34  fails
#   mysql:8.0     Oracle Linux 9.7  glibc 2.34  fails  (currently 8.0.46)
#
# On a too-new glibc the failure is "Can't create thread to handle bootstrap
# (errno: 1)" followed by "Data Dictionary initialization failed" during
# --initialize, i.e. before any init script runs. The container then restarts
# forever complaining that the data directory has files in it, which hides the
# real cause. Upgrading Docker to 23+ lifts the pin.
FROM mysql:8.0.36

ENV TZ=Asia/Shanghai

# Scripts in /docker-entrypoint-initdb.d run once, in filename order, and only
# when the data directory is empty.
#
# Only the JeecgBoot schema is seeded. The upstream template also ships
# tables_nacos.sql and tables_xxl_job.sql, which create separate `nacos` and
# `xxl_job` databases; both belong to the microservice deployment and are not
# used here -- the monolithic api runs with jeecg.xxljob.enabled false and never
# reads either database. The dumps are still in apps/api/db/ (and excluded from
# the build context by .dockerignore), so import them by hand if you switch to
# the cloud modules.
#
# The numeric prefix is kept even though there is a single script: adding a
# second one later must not depend on the shell's glob order.
#
# The build context is the repository root (see docker-compose.infra.yml), so
# every source path is repo-root-relative.
COPY apps/api/db/jeecgboot-mysql-5.7.sql /docker-entrypoint-initdb.d/01-jeecgboot.sql

# The dump still uses two constructs 8.0 deprecated: CHARACTER SET utf8 (an
# alias for utf8mb3; the older tables use it, the newer ones use utf8mb4) and
# integer display widths such as int(11). Both are accepted, and at the default
# log_error_verbosity neither reaches the error log -- a clean first-boot log is
# the expected outcome, not a sign the import was skipped. Verified on this
# machine: 133 tables in jeecg-boot, no other database created, 0 ERROR lines.
