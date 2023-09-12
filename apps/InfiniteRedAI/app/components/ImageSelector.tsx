import * as React from "react"
import { useEffect } from "react"
import { View, ViewStyle, ActivityIndicator, TextStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { Text } from "app/components/Text"
import { useExampleImage, UseExampleImageStatus, SelectedImage } from "../utils/useExampleImage"
import { RNMLKitImageView } from "./RNMLKitImageView"
import { Button } from "./Button"
import { colors } from "../theme"
import { ImageFilter, ImageGrouper } from "../utils/useExampleImage/examples"
import { BoundingBox } from "@infinitered/react-native-mlkit-core"

export interface ImageSelectorProps {
  onImageChange(image: SelectedImage): void
  onStatusChange(status: UseExampleImageStatus): void
  status: "init" | "noPermissions" | "done" | "error" | "loading" | UseExampleImageStatus
  statusMessage: string
  isLoading: boolean
  images?: {
    filter?: ImageFilter
    groupBy?: ImageGrouper
  }
  boundingBoxes?: BoundingBox[]
}

export const ImageSelector = observer(function ImageSelector({
  images,
  onImageChange,
  onStatusChange,
  status,
  statusMessage,
  isLoading,
  boundingBoxes,
}: ImageSelectorProps) {
  const [_status, _setStatus] = React.useState<UseExampleImageStatus>("init")

  const { image, takePhoto, selectPhoto, nextPhoto, clearPhoto, categories } = useExampleImage(
    _setStatus,
    {
      filter: images?.filter ?? "all",
      groupBy: images?.groupBy ?? "none",
    },
  )

  useEffect(() => {
    onStatusChange(_status)
  }, [_status, onStatusChange])

  useEffect(() => {
    onImageChange(image)
  }, [image, onImageChange])

  return (
    <View style={$container}>
      {!isLoading ? (
        <RNMLKitImageView
          image={image}
          onPress={image ? clearPhoto : takePhoto}
          boxes={boundingBoxes}
        />
      ) : (
        <View style={$imagePlaceholder}>
          <ActivityIndicator />
          <Text>Loading Model....</Text>
        </View>
      )}
      <View style={$status}>
        {status === "classifying" ? (
          <ActivityIndicator />
        ) : (
          <Text style={$statusMessage} size={status === "done" ? "xl" : undefined}>
            {statusMessage}
          </Text>
        )}
      </View>
      <View>
        {image ? (
          <Button text={"Clear Photo"} onPress={clearPhoto} style={$button} disabled={isLoading} />
        ) : (
          <Button
            text={"Select Photo"}
            onPress={selectPhoto}
            style={$button}
            disabled={isLoading}
          />
        )}
        <View style={$randomImageButtons}>
          {categories.map((type) => (
            <Button
              disabled={isLoading}
              key={`${type}-button`}
              text={type}
              onPress={async () => {
                clearPhoto()
                nextPhoto(type)
              }}
              style={[$button, $rowButton]}
            />
          ))}
        </View>
      </View>
    </View>
  )
})

const $container: ViewStyle = {
  justifyContent: "center",
}

const $imagePlaceholder: ViewStyle = {
  borderWidth: 1,
  borderTopWidth: 1,
  borderLeftWidth: 1,
  borderColor: "rgba(0,0,0,0.2)",
  borderTopColor: "rgba(0,0,0,0.4)",
  borderLeftColor: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  aspectRatio: 16 / 9,
  alignItems: "center",
  padding: 8,
  backgroundColor: "rgba(255,255,255,0.9)",
}

const $statusMessage: TextStyle = {
  color: "rgba(0,0,0,0.6)",
}
const $status: ViewStyle = {
  height: 50,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}

const $randomImageButtons: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
}
const $button: ViewStyle = { backgroundColor: colors.palette.accent300, marginVertical: 8 }
const $rowButton: ViewStyle = { flexGrow: 1, marginHorizontal: 2 }
