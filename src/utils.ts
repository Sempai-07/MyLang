function formatMessage(message: string, params?: Record<string, any>): string {
  if (!params) return message;
  return message.replace(/\${(.*?)}/g, (_, key) => {
    return key in params ? String(params[key]) : `{${key}}`;
  });
}

export { formatMessage };
