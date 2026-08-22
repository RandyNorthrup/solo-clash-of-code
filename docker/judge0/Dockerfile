FROM judge0/judge0:1.13.1@sha256:6b5d6a66aa19a8e878a52ea3c6a560afc1086734d96e2885b561fd5c6018f082 AS isolate-builder

USER root

ARG ISOLATE_VERSION=2.2.1
ARG ISOLATE_COMMIT=9c84554464d2aa9161a424e70af67f4210a12c45

RUN sed -i 's|http://deb.debian.org/debian|http://archive.debian.org/debian|g' /etc/apt/sources.list && \
    sed -i 's|http://security.debian.org/debian-security|http://archive.debian.org/debian-security|g' /etc/apt/sources.list && \
    printf 'Acquire::Check-Valid-Until "false";\n' > /etc/apt/apt.conf.d/99no-check-valid-until && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      ca-certificates \
      git \
      libcap-dev \
      libsystemd-dev \
      patch \
      pkg-config && \
    rm -rf /var/lib/apt/lists/*

COPY docker/judge0/isolate-quotactl.patch /tmp/isolate-quotactl.patch

RUN git clone --branch "v${ISOLATE_VERSION}" --depth=1 https://github.com/ioi/isolate.git /tmp/isolate && \
    test "$(git -C /tmp/isolate rev-parse HEAD)" = "${ISOLATE_COMMIT}" && \
    patch --directory=/tmp/isolate --strip=1 < /tmp/isolate-quotactl.patch && \
    make --directory=/tmp/isolate install PREFIX=/usr/local && \
    rm -rf /tmp/isolate /tmp/isolate-quotactl.patch

FROM judge0/judge0:1.13.1@sha256:6b5d6a66aa19a8e878a52ea3c6a560afc1086734d96e2885b561fd5c6018f082

USER root

COPY --from=isolate-builder /usr/local/bin/isolate /usr/local/bin/isolate
COPY --from=isolate-builder /usr/local/bin/isolate-check-environment /usr/local/bin/isolate-check-environment
COPY --from=isolate-builder /usr/local/sbin/isolate-cg-keeper /usr/local/sbin/isolate-cg-keeper
COPY --from=isolate-builder /usr/local/etc/isolate /usr/local/etc/isolate
COPY --from=isolate-builder /usr/local/lib/systemd/system/isolate.service /usr/local/lib/systemd/system/isolate.service
COPY --from=isolate-builder /usr/local/lib/systemd/system/isolate.slice /usr/local/lib/systemd/system/isolate.slice

COPY docker/judge0/judge0-cgroup-v2.patch /tmp/judge0-cgroup-v2.patch
RUN patch --directory=/api --strip=1 < /tmp/judge0-cgroup-v2.patch && \
    rm /tmp/judge0-cgroup-v2.patch

COPY docker/judge0/ensure-isolate-runtime /api/scripts/ensure-isolate-runtime
RUN chmod 0755 /api/scripts/ensure-isolate-runtime

LABEL io.solo-clash.judge0.base="1.13.1" \
      io.solo-clash.isolate.version="2.2.1" \
      io.solo-clash.isolate.commit="9c84554464d2aa9161a424e70af67f4210a12c45"

USER judge0
