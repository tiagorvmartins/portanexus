diff --git a/node_modules/react-native-web-refresh-control/src/RefreshControl.web.js b/node_modules/react-native-web-refresh-control/src/RefreshControl.web.js
index b2351e6..c638d23 100644
--- a/node_modules/react-native-web-refresh-control/src/RefreshControl.web.js
+++ b/node_modules/react-native-web-refresh-control/src/RefreshControl.web.js
@@ -1,5 +1,5 @@
 import React, { useRef, useEffect, useCallback, useMemo } from 'react'
-import { View, Text, PanResponder, Animated, ActivityIndicator, findNodeHandle } from 'react-native'
+import { View, Text, PanResponder, Animated, ActivityIndicator } from 'react-native'
 import PropTypes from 'prop-types'
 
 const arrowIcon =
@@ -77,9 +77,9 @@ export default function RefreshControl({
       onStartShouldSetPanResponderCapture: () => false,
       onMoveShouldSetPanResponder: (_,gestureState) => {
         if (!containerRef.current) return false
-        const containerDOM = findNodeHandle(containerRef.current)
-        if (!containerDOM) return false
-        return containerDOM.children[0].scrollTop === 0
+        const scrollContainer = containerRef.current?.firstChild
+        if (!scrollContainer) return false
+        return scrollContainer.scrollTop === 0
         && (Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 2 && Math.abs(gestureState.vy) > Math.abs(gestureState.vx) * 2.5)
       },
       onMoveShouldSetPanResponderCapture: () => false,
