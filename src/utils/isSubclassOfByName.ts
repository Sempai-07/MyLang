function isSubclassOfByName(subject: any, targetName: string): boolean {
  if (!subject) return false;

  let proto = typeof subject === "function" ? subject : subject.constructor;

  while (proto) {
    if (proto.name === targetName) return true;
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}

export { isSubclassOfByName };
