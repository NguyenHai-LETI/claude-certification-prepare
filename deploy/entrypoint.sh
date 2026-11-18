#!/bin/sh
# Container start: clone the data repo (latest results/bank from GitHub), then run the supervisor.
#   GITHUB_TOKEN     fine-grained token, Contents: Read and write on this repo → results are pushed back (needed to keep them)
#   CERT_GIT_REPO    default github.com/NguyenHai-LETI/claude-certification-prepare.git
#   CERT_GIT_BRANCH  default main
set -e

DATA=/data/repo
REPO="${CERT_GIT_REPO:-github.com/NguyenHai-LETI/claude-certification-prepare.git}"
BRANCH="${CERT_GIT_BRANCH:-main}"

git config --global user.name "${CERT_GIT_NAME:-cert-cloud}"
git config --global user.email "${CERT_GIT_EMAIL:-cert-cloud@users.noreply.github.com}"
git config --global pull.rebase true

if [ -n "$GITHUB_TOKEN" ]; then
  # credential helper reads the token from the environment: it never lands in .git/config or in sync error messages
  git config --global credential.helper '!f() { echo username=x-access-token; echo "password=$GITHUB_TOKEN"; }; f'
else
  echo "⚠️  GITHUB_TOKEN chưa đặt: tắt đồng bộ git — kết quả làm bài sẽ MẤT khi server khởi động lại."
  export CERT_SYNC=0
fi

rm -rf "$DATA"
if git clone --branch "$BRANCH" "https://$REPO" "$DATA"; then
  export CERT_ROOT="$DATA"
else
  echo "⚠️  Không clone được repo dữ liệu — chạy bằng dữ liệu đóng gói trong image, không đồng bộ."
  export CERT_SYNC=0
fi

exec node scripts/run.ts
