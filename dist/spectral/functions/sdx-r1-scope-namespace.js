// Reports an OAuth2 scope whose namespace (the part before the first ":") is
// not in the registered SDX scope namespace list. A scope without ":" has no
// namespace to check; sdx-r1-resource-scope-format reports it.
var sdxR1ScopeNamespace = (scope, options) => {
  if (typeof scope !== 'string' || !scope.includes(':')) return [];

  const namespace = scope.split(':')[0];
  const namespaces = Array.isArray(options?.namespaces) ? options.namespaces : [];
  if (namespaces.includes(namespace)) return [];

  return [
    {
      message: `OAuth2 scope "${scope}" uses namespace "${namespace}", which is not a registered SDX scope namespace.`,
    },
  ];
};

export { sdxR1ScopeNamespace as default };
