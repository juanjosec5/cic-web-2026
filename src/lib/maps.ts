export function isSafeMapUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const { protocol, hostname, pathname } = new URL(url);
    return (
      protocol === 'https:' &&
      (hostname === 'www.google.com' || hostname === 'maps.google.com') &&
      pathname.startsWith('/maps/')
    );
  } catch {
    return false;
  }
}
