import React, { useEffect, useState } from 'react';
import { View, Switch, StyleSheet, Image, TouchableOpacity, Modal, Text, SafeAreaView } from 'react-native';
import Icon from '@expo/vector-icons/FontAwesome';
import { useAuth } from 'src/store/useAuth';
import SecureStoreEntry from 'src/enums/SecureStoreEntry';


const Header = ({navigation, screen}: any) => {

    const { theme, toggleThemeAndPersist, setStackOrderBy, setContainerOrderBy, setProfileTheme } = useAuth()
    const styles = createStyles(theme);


    useEffect(() => {
        setProfileTheme(theme as SecureStoreEntry)
    }, [ theme ])

    const sortingOptions = [
        { label: "Created (Asc)", value: "createdDateAsc" },
        { label: "Created (Desc)", value: "createdDateDesc" },
        { label: "Name (Asc)", value: "nameAsc" },
        { label: "Name (Desc)", value: "nameDesc" },
    ];
    
    const [isModalVisible, setModalVisible] = useState(false);
    
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const handleSort = async (criteria: any) => {
        if (screen === 'stacks') {
            await setStackOrderBy(criteria)
        } else if (screen === 'containers') {
            await setContainerOrderBy(criteria)
        }
    };

    return (
        <View style={styles.topHeaderContainer}>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon 
                    name="bars" 
                    size={24} 
                    color={theme === 'light' ? '#333' : '#fff'} 
                />
                <Image style={styles.logo} source={theme === 'light' ? require('src/images/porta-nexus-light.png') : require('src/images/porta-nexus-dark.png')} />
                </View>
            </TouchableOpacity>
            <View style={styles.headerContainer}>
                <Icon
                    name="sun-o"
                    size={18}
                    color={theme === 'dark' ? '#fff' : '#000'}
                />
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={theme === 'light' ? "#f4f3f4" : "#f5dd4b"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => toggleThemeAndPersist()}
                    value={theme === 'dark'}
                />
                <Icon
                    name="moon-o"
                    size={18}
                    color={theme === 'dark' ? '#fff' : '#000'}
                />
                <View style={styles.sortButtonWrapper}>
                    {(screen === 'stacks' || screen === 'containers') ? (
                        <TouchableOpacity style={styles.sortButton} onPress={toggleModal}>
                        <Icon
                            name='sort'
                            size={16}
                            color={theme === 'dark' ? '#fff' : '#000'}
                        />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.sortButtonPlaceholder} />
                    )}
                </View>
            </View>
            
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                    {sortingOptions.map(option => (
                        <TouchableOpacity
                            key={option.value}
                            style={styles.optionButton}
                            onPress={() => { setModalVisible(!isModalVisible); handleSort(option.value); setModalVisible(!isModalVisible); }}
                        >
                        <Text style={styles.textLabel}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
};

const createStyles = (theme: string) => {
    return StyleSheet.create({
        sortButtonWrapper: {
            marginLeft: 20,
            width: 40, // fixed width to ensure layout consistency
            alignItems: 'center',
            justifyContent: 'center',
        },

        sortButton: {
            backgroundColor: 'rgba(221,221,221,0.6)',
            padding: 10,
            borderRadius: 5,
        },

        sortButtonPlaceholder: {
            width: 40,
            height: 40,
        }, 
        textLabel: {
            color: theme === 'light' ? '#000000' : '#ffffff',
        },
        modalContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
        },
        modalContent: {
            backgroundColor: theme === 'light' ? '#ffffff' : '#000000',
            padding: 20,
            borderRadius: 5,
        },
        optionButton: {
            padding: 10,
            borderBottomWidth: 1,
            borderColor: "#ccc",
        },
        topHeaderContainer: {
            marginTop: 56,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginLeft: 16,
        },
        headerContainer: {
            backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        button: {
            alignItems: 'center',
            backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
            padding: 10,
        },
        logo: {
            width: 120,
            height: 60,
            marginLeft: 10,
            
        },
        container: {
            flex: 1,
            backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
            padding: 16
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 16
        },
        headerText: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme === 'light' ? '#333333' : '#e0e0e0',
        },
        headerSubText: {
            fontSize: 12,
            color: theme === 'light' ? '#333333' : '#e0e0e0',
        },
    });
};

export default Header

