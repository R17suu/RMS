import { useColorScheme, View } from 'react-native'
import { Colors } from '../constants/Colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'


const ThemedView = ({ style, safe = false, children, ...props }) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.dark

    if (!safe) {
        return (
            <View
                style={[{ backgroundColor: theme?.bgPrimary }, style]}
                {...props}
            >
                {children}
            </View>
        )
    }

    const insets = useSafeAreaInsets()

    return (
        <View
            style={[{
                backgroundColor: theme?.bgPrimary,
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
            }, style]}
            {...props}
        >
            {children}
        </View>
    )
}

export default ThemedView