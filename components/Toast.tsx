import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    onHide: () => void;
    visible: boolean;
}

export const Toast = ({ message, type = 'success', onHide, visible }: ToastProps) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const colors = {
        success: '#e94560', // Using app's accent color (Red/Pink)
        error: '#ff4757',
        info: '#2f3542',
    };

    const icons = {
        success: 'checkmark-circle' as const,
        error: 'alert-circle' as const,
        info: 'information-circle' as const,
    };

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 50, // Top margin
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();

            // Auto hide after 3 seconds
            const timer = setTimeout(() => {
                hide();
            }, 3000);

            return () => clearTimeout(timer);
        } else {
            hide();
        }
    }, [visible]);

    const hide = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            if (visible) onHide();
        });
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY }], opacity }
            ]}
        >
            <View style={[styles.content, { borderLeftColor: colors[type] }]}>
                <Ionicons name={icons[type]} size={24} color={colors[type]} />
                <Text style={styles.message}>{message}</Text>
                <TouchableOpacity onPress={hide}>
                    <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        width: width * 0.9,
        backgroundColor: '#1a1a2e', // Matches app bg darker shade or similar
        borderRadius: 8,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
        borderLeftWidth: 4,
        gap: 12,
        // Add a slight lighter styling for contrast on dark bg if needed
        backgroundColor: '#252a41',
    },
    message: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
        fontWeight: '500',
    }
});
