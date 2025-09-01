#!/usr/bin/env bash
set -euo pipefail
if [[ -z "${LINUX_GPG_PRIVATE_KEY:-}" || -z "${LINUX_GPG_PASSPHRASE:-}" ]]; then
  echo "LINUX_GPG_PRIVATE_KEY / LINUX_GPG_PASSPHRASE not set; skipping." >&2
  exit 0
fi

echo "$LINUX_GPG_PRIVATE_KEY" | gpg --batch --yes --import
GPG_KEYID=$(gpg --list-keys --with-colons | awk -F: '/^pub/ {print $5; exit}')

shopt -s nullglob
for deb in desktop/dist_electron/*.deb; do
  echo "Signing $deb"
  dpkg-sig --sign builder -k "$GPG_KEYID" "$deb"
done

for rpm in desktop/dist_electron/*.rpm; do
  echo "%_gpg_name $GPG_KEYID" > ~/.rpmmacros
  rpm --addsign "$rpm"
done
