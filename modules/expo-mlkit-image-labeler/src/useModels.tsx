import { ExpoMLKitClassifier } from "./ExpoMLKitClassifier";
import React, { useState, useEffect, PropsWithChildren } from "react";
import { useAssets } from "expo-asset";
import {
  ExpoMLKitCustomImageLabelerOptions,
  ExpoMLKitImageLabelerSpec,
} from "./ExpoMLKitImageLabeler";
import {
  ModelAssets,
  ExpoMLKitCustomImageLabelerContext,
} from "./ExpoMLKItCustomImageLabelerContext";

export type AssetRecord = Record<
  string,
  { model: number; options?: ExpoMLKitCustomImageLabelerOptions }
>;

export type Models<T extends Record<string, any>> = {
  [K in keyof T]: ExpoMLKitClassifier;
};

export function useModels<T extends AssetRecord>(assets: T) {
  console.log(assets);
  const assetNumbers = Object.values(assets).map(({ model }) => model);
  const [assetObjects, assetsError] = useAssets(assetNumbers);
  const [loadedModels, setLoadedModels] = useState<Partial<Models<T>>>({});

  useEffect(() => {
    async function loadModels() {
      const modelPromises = Object.entries(assets).map(
        async ([name, modelInfo]) => {
          console.log("-->", { name, modelInfo });
          const assetObjectIndex = assetNumbers.indexOf(modelInfo.model);
          const assetObject = assetObjects?.[assetObjectIndex];
          if (!assetObject?.localUri) return Promise.resolve([name, undefined]);

          const modelSpec: ExpoMLKitImageLabelerSpec = {
            modelPath: assetObject.localUri,
            options: modelInfo.options,
            modelName: name,
          };
          const model = new ExpoMLKitClassifier(modelSpec);
          await model.load();

          return [name, model];
        }
      );

      const models = await Promise.all(modelPromises);

      let newModels = Object.fromEntries(models);
      setLoadedModels(newModels);
    }

    if (assetObjects && !assetsError) {
      loadModels();
    }
  }, [assets, assetObjects, assetsError]);

  return {
    models: loadedModels,
    ModelContextProvider: (props: PropsWithChildren<{}>) => (
      <ModelContextProviderComponent {...props} models={loadedModels} />
    ),
  };
}

function ModelContextProviderComponent<T extends ModelAssets>({
  children,
  models,
}: React.PropsWithChildren<{ models: Partial<Models<T>> }>) {
  return (
    <ExpoMLKitCustomImageLabelerContext.Provider value={{ models }}>
      {children}
    </ExpoMLKitCustomImageLabelerContext.Provider>
  );
}
