import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import api from '../../services/api';

import { Toast } from '../../components/Toast';

const { width } = Dimensions.get('window');

export default function AddMemberScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'manual' | 'csv'>('manual');
    const [loading, setLoading] = useState(false);

    // Toast State
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ visible: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, visible: false }));
    };

    // Manual Entry Form State
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('student');

    const ROLES = [
        { label: 'Student', value: 'student', icon: 'school' },
        { label: 'Driver', value: 'driver', icon: 'car' },
        { label: 'Teacher', value: 'teacher', icon: 'book' },
        { label: 'Parent', value: 'parent', icon: 'home' },
        { label: 'Management', value: 'management', icon: 'briefcase' },
        { label: 'Admin', value: 'admin', icon: 'shield-checkmark' },
    ];

    // CSV Upload State
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

    const handleManualSubmit = async () => {
        if (!username || !email) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/members/create/', {
                name: username,
                email,
                phone_number: phone,
                role
            });
            showToast('Member created successfully. Credentials sent via email.', 'success');
            setTimeout(() => router.back(), 2000);
        } catch (error: any) {
            console.error(error);
            const errorData = error.response?.data;
            if (errorData?.email && errorData.email[0].includes('already exists')) {
                showToast('Member Added Already', 'error');
            } else {
                showToast(errorData?.detail || 'Failed to create member', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'text/csv',
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            setSelectedFile(result.assets[0]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCsvUpload = async () => {
        if (!selectedFile) {
            showToast('Please select a CSV file first', 'error');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', {
            uri: selectedFile.uri,
            name: selectedFile.name,
            type: 'text/csv'
        } as any);

        try {
            const response = await api.post('/auth/members/import/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            showToast(response.data.message, 'success');
            setTimeout(() => router.back(), 2000);
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.error || 'Failed to upload CSV';
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
            />

            {/* Background Decoration */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New Member</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.tabWrapper}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'manual' && styles.activeTab]}
                        onPress={() => setActiveTab('manual')}
                    >
                        <Text style={[styles.tabText, activeTab === 'manual' && styles.activeTabText]}>Manual Entry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'csv' && styles.activeTab]}
                        onPress={() => setActiveTab('csv')}
                    >
                        <Text style={[styles.tabText, activeTab === 'csv' && styles.activeTabText]}>CSV Import</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {activeTab === 'manual' ? (
                        <View style={styles.formContainer}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Basic Information</Text>
                                <Text style={styles.sectionSubtitle}>Enter the member's details below.</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Full Name</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Jane Doe"
                                        placeholderTextColor="#666"
                                        value={username}
                                        onChangeText={setUsername}
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="jane@collegebus.com"
                                        placeholderTextColor="#666"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone Number (Optional)</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="+1 234 567 8900"
                                        placeholderTextColor="#666"
                                        value={phone}
                                        onChangeText={setPhone}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Assign Role</Text>
                                <View style={styles.roleContainer}>
                                    {ROLES.map((r) => (
                                        <TouchableOpacity
                                            key={r.value}
                                            style={[styles.roleButton, role === r.value && styles.roleButtonActive]}
                                            onPress={() => setRole(r.value)}
                                        >
                                            <Ionicons
                                                name={r.icon as any}
                                                size={18}
                                                color={role === r.value ? '#fff' : '#888'}
                                            />
                                            <Text style={[styles.roleText, role === r.value && styles.roleTextActive]}>
                                                {r.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.footerNote}>
                                <Ionicons name="shield-checkmark-outline" size={16} color="#4caf50" />
                                <Text style={styles.noteText}>
                                    A secure password will be auto-generated and emailed.
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleManualSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <View style={styles.btnContent}>
                                        <Text style={styles.submitButtonText}>Create Member</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.formContainer}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Bulk Import</Text>
                                <Text style={styles.sectionSubtitle}>Upload a CSV file to add multiple members at once.</Text>
                            </View>

                            <View style={[styles.uploadCard, selectedFile ? styles.uploadCardActive : {}]}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name={selectedFile ? "document-text" : "cloud-upload"} size={32} color="#fff" />
                                </View>

                                {selectedFile ? (
                                    <View style={styles.fileDetails}>
                                        <Text style={styles.fileName}>{selectedFile.name}</Text>
                                        <Text style={styles.fileSize}>Ready to upload</Text>
                                    </View>
                                ) : (
                                    <View style={styles.uploadTexts}>
                                        <Text style={styles.uploadTitle}>Tap to Upload CSV</Text>
                                        <Text style={styles.uploadDesc}>
                                            Required columns: name, email
                                        </Text>
                                        <Text style={styles.uploadSubDesc}>
                                            Optional: phone_number, role
                                        </Text>
                                    </View>
                                )}

                                {selectedFile && (
                                    <TouchableOpacity style={styles.removeFileBtn} onPress={() => setSelectedFile(null)}>
                                        <Ionicons name="close-circle" size={24} color="#f44336" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {!selectedFile && (
                                <TouchableOpacity style={styles.pickButton} onPress={pickDocument}>
                                    <Text style={styles.pickButtonText}>Choose File</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.submitButton, !selectedFile && styles.disabledButton]}
                                onPress={handleCsvUpload}
                                disabled={loading || !selectedFile}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <View style={styles.btnContent}>
                                        <Ionicons name="cloud-done-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={styles.submitButtonText}>Start Import</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    bgCircle1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(233, 69, 96, 0.1)',
    },
    bgCircle2: {
        position: 'absolute',
        top: 200,
        left: -150,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: 'rgba(15, 52, 96, 0.3)',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    tabWrapper: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#16213e',
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: '#e94560',
    },
    tabText: {
        color: '#888',
        fontWeight: 'bold',
        fontSize: 14,
    },
    activeTabText: {
        color: '#fff',
    },
    content: {
        padding: 24,
        paddingTop: 0,
    },
    formContainer: {
        backgroundColor: '#16213e', // Card-like background for form
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        gap: 24,
    },
    sectionHeader: {
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#888',
        marginTop: 4,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: '#ccc',
        fontSize: 14,
        marginLeft: 4,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        color: '#fff',
        fontSize: 16,
    },
    roleContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    roleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: '#1a1a2e',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        gap: 8,
    },
    roleButtonActive: {
        backgroundColor: '#e94560',
        borderColor: '#e94560',
    },
    roleText: {
        color: '#888',
        fontSize: 13,
        fontWeight: '500',
    },
    roleTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    footerNote: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    noteText: {
        color: '#4caf50',
        fontSize: 12,
        flex: 1,
    },
    submitButton: {
        backgroundColor: '#e94560',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: "#e94560",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    disabledButton: {
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
        backgroundColor: '#666',
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // CSV Styles
    uploadCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderStyle: 'dashed',
    },
    uploadCardActive: {
        borderColor: '#4caf50',
        borderStyle: 'solid',
        backgroundColor: 'rgba(76, 175, 80, 0.05)',
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#2a2a40',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    uploadTexts: {
        alignItems: 'center',
    },
    uploadTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    uploadDesc: {
        color: '#888',
        textAlign: 'center',
        fontSize: 13,
    },
    uploadSubDesc: {
        color: '#666',
        textAlign: 'center',
        fontSize: 12,
        marginTop: 4,
    },
    fileDetails: {
        alignItems: 'center',
    },
    fileName: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 4,
    },
    fileSize: {
        color: '#4caf50',
        fontSize: 12,
    },
    removeFileBtn: {
        marginTop: 16,
    },
    pickButton: {
        backgroundColor: 'rgba(233, 69, 96, 0.1)',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(233, 69, 96, 0.3)',
    },
    pickButtonText: {
        color: '#e94560',
        fontWeight: 'bold',
    },
});
