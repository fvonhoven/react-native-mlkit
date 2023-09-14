import { Image, ImageStyle, ImageSource } from "expo-image";
import React, { useMemo } from "react";
import { View, ViewStyle } from "react-native";

import { BoundingBoxView } from "./BoundingBoxView";
import { useLayout, useImageScale, ContentFit, BoundingBox } from "../hooks";

interface ImageWithBoundingBoxesProps {
  image?: {
    localUri?: string | null;
    uri?: string | null;
    width?: number | null;
    height?: number | null;
  };
  boundingBoxes?: BoundingBox[];
  style?: ViewStyle | ViewStyle[];
  contentFit?: Exclude<ContentFit, "cover">;
  imageStyle?: ImageStyle;
  testId?: string;
}

export function ImageWithBoundingBoxes({
  image,
  boundingBoxes = [],
  style,
  imageStyle,
  contentFit = "scale-down",
  testId,
}: ImageWithBoundingBoxesProps) {
  const [containerLayout, onLayout] = useLayout();
  const scaleFactor = useImageScale(contentFit, containerLayout, image);
  const localUri = image?.localUri ?? image?.uri ?? undefined;
  const imageSource = useMemo(() => {
    return localUri
      ? ({
          uri: localUri,
          width: image?.width,
          height: image?.height,
        } as ImageSource)
      : undefined;
  }, [localUri]);

  return (
    <View style={style} onLayout={onLayout} testID={testId}>
      <Image
        testID={`${testId}-image`}
        source={imageSource}
        style={[{ width: "100%", height: "100%" }, imageStyle ?? {}]}
        contentFit={contentFit}
      />
      {boundingBoxes.map((box, index) => (
        <BoundingBoxView
          box={box}
          scale={scaleFactor}
          key={index}
          testId={`${testId}-boundingBoxView`}
        />
      ))}
    </View>
  );
}
