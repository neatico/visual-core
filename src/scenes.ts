export type SceneRenderer<Input, Output> = (input: Input) => Output;
/** Create an isolated registry so applications can supply their own scene renderers. */
export function createSceneRegistry<Input, Output>() {
  const renderers = new Map<string, SceneRenderer<Input, Output>>();
  return {
    register(name: string, render: SceneRenderer<Input, Output>) {
      if (!/^[a-z][a-z0-9-]*$/.test(name))
        throw new TypeError("Use a lowercase, hyphenated scene name");
      if (typeof render !== "function")
        throw new TypeError("A scene renderer must be a function");
      if (renderers.has(name))
        throw new Error(`Scene already registered: ${name}`);
      renderers.set(name, render);
      return () => {
        if (renderers.get(name) === render) renderers.delete(name);
      };
    },
    render(name: string, input: Input): Output {
      const render = renderers.get(name);
      if (!render) throw new Error(`Unknown scene: ${name}`);
      return render(input);
    },
    list(): string[] {
      return [...renderers.keys()];
    },
  };
}
