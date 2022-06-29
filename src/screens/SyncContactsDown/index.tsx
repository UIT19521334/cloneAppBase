import { useNavigation } from '@react-navigation/native'
import { Container, Content, Footer, Input } from 'native-base'
import React from 'react'
import DeviceInfo from 'react-native-device-info'
import { Platform, StyleSheet, TouchableHighlight, TouchableOpacity, AppState } from 'react-native'
import { check, openSettings, PERMISSIONS, request } from 'react-native-permissions'
import { Body, Header, LargeHeader, Right, SpaceHM, Title } from '../../components/CustomComponentView'
import { Colors } from '../../themes/colors/Colors'
import { Icon } from '../../themes/Icons/CustomIcon'
import { Box, Text } from '../../themes/themes'
import { getLabel, HEADER_HEIGHT, heightDevice, widthDevice, widthResponse } from '../../utils/commons/commons'
import Contacts from 'react-native-contacts';
import Toast from 'react-native-root-toast'
import Global from '../../Global'
import RadioButton from '../../components/RadioButton'
import { PARAMS_ALERT } from '../../utils/Models/models'
import { showAlert } from '../../redux/actions/alert'
import { useDispatch } from 'react-redux'
import IndicatorLoading from '../../components/IndicatorLoading'
import { LoadingList } from '../../components/Loading'

export default function SyncContactsDown() {
    //Declare state
    const navigation = useNavigation()
    const dispatch = useDispatch();
    const [permissionBlocked, setPermissionBlocked] = React.useState(false)
    const [permissionDenied, setPermissionDenied] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [firstLoading, setFirstLoading] = React.useState(false);
    const [contactsKeyWord, setContactsKeyWord] = React.useState('');
    const [updatedContactList, setUpdatedContactList] = React.useState([]);
    const [selectedUpdatedContactList, setSelectedUpdatedContactList] = React.useState([]);
    const [isSelectAllUpdatedContact, setIsSelectAllUpdatedContact] = React.useState(false);
    const [newContactList, setNewContactList] = React.useState([]);
    const [isSelectAllNewContact, setIsSelectAllNewContact] = React.useState(false);
    const [selectedNewContactList, setSelectedNewContactList] = React.useState([]);
    const [showUpdateContactsModal, setShowUpdateContactsModal] = React.useState(false);
    const [showUndoButton, setShowUndoButton] = React.useState(false);
    const [isClickedUndoButton, setIsClickedUndoButton] = React.useState(false);

    //Did mount
    React.useEffect(() => {
        // Config header screen
        const headerOptions = {
            header: () => null
        }

        navigation.setOptions(headerOptions)


        //init
        init();

        AppState.addEventListener('change', (state) => {
            if (state == 'active') {
                init();
            }
        });

        return () => {
            AppState.removeEventListener('change', () => { });
        }
    }, []);

    React.useEffect(() => {

        init();

        return () => { }
    }, [contactsKeyWord])

    const init = () => {
        check(
            Platform.select({
                ios: PERMISSIONS.IOS.CONTACTS,
                android: PERMISSIONS.ANDROID.READ_CONTACTS
            })
        ).then(response => {
            if (response == 'blocked') {
                //Permission has blocked
                setPermissionBlocked(true);

            }
            else if (response == 'granted') {
                //Permission has granted
                getPhoneContactList()
            }
            else {
                //Permission hasn't granted
                request(
                    Platform.select({
                        ios: PERMISSIONS.IOS.CONTACTS,
                        android: PERMISSIONS.ANDROID.READ_CONTACTS
                    })
                )
                    .then(res => {
                        if (res == 'granted') {

                        }
                        else if (res == 'denied') {
                            setPermissionDenied(true);
                        }
                    })
                    .catch((err) => {
                    })
            }
        })
            .catch((err) => {
            })
    }

    function _renderViewPermissionBlock(): React.ReactNode {
        return (
            <Box
                flex={1}
                backgroundColor='white1'
                justifyContent='center'
                alignItems='center'
            >
                <Box
                    opacity={.6}
                >
                    <Icon name='ban' color={Colors.functional.dangerous} size={widthDevice * .2} />
                </Box>

                <Box
                    paddingHorizontal='l'
                >
                    <Text
                        textAlign='center'
                        fontSize={16}
                        color='black3'
                        paddingVertical='l'
                    >
                        {getLabel('tools.alert_request_permission_contacts_msg')}
                    </Text>
                </Box>

                <TouchableOpacity
                    style={{
                        backgroundColor: Colors.functional.primary,
                        paddingVertical: 10,
                        paddingHorizontal: 24,
                        borderRadius: 6
                    }}
                    onPress={() => {
                        openSettings().catch((err) => {

                        })
                    }}
                >
                    <Text color='white1' fontSize={16}>{getLabel('tools.label_open_settings')}</Text>
                </TouchableOpacity>
            </Box>
        )
    }

    function _renderViewPermissionDenied(): React.ReactNode {
        return (
            <Box
                flex={1}
                backgroundColor='white1'
                justifyContent='center'
                alignItems='center'
            >
                <Box
                    opacity={.6}
                >
                    <Icon name='ban' color={Colors.functional.dangerous} size={widthDevice * .2} />
                </Box>

                <Box
                    paddingHorizontal='l'
                >
                    <Text
                        textAlign='center'
                        fontSize={16}
                        color='black3'
                        paddingVertical='l'
                    >
                        {getLabel('tools.alert_request_permission_contacts_msg')}
                    </Text>
                </Box>

                <TouchableOpacity
                    style={{
                        backgroundColor: Colors.functional.primary,
                        paddingVertical: 10,
                        paddingHorizontal: 24,
                        borderRadius: 6
                    }}
                    onPress={() => {
                        request(
                            Platform.select({
                                ios: PERMISSIONS.IOS.CONTACTS,
                                android: PERMISSIONS.ANDROID.READ_CONTACTS
                            })
                        )
                            .then(res => {
                                if (res == 'granted') {

                                }
                            })
                            .catch((err) => {
                            })
                    }}
                >
                    <Text color='white1' fontSize={16}>{getLabel('tools.label_open_settings')}</Text>
                </TouchableOpacity>
            </Box>
        )
    }

    const getPhoneContactList = async () => {
        setFirstLoading(true);
        let contacts = await Contacts.getAll();
        let tmpContactList = [];
        if (contacts.length > 0) {
            contacts.map((contact) => {
                if (contact?.phoneNumbers?.length > 0) {

                    let tmpContact = {};
                    tmpContact['firstname'] = contact?.givenName || '';

                    //Set last name for contact
                    if (contact?.middleName) {
                        if (contact.familyName) {
                            tmpContact['lastname'] = contact.familyName + ' ' + contact.middleName;

                            //Set full name
                            if (contact.givenName) {
                                tmpContact['full_name'] = contact.givenName + ' ' + contact.middleName + ' ' + contact.familyName;
                            }
                            else {
                                tmpContact['full_name'] = contact.middleName + ' ' + contact.familyName;
                            }
                        }
                        else {
                            tmpContact['lastname'] = contact.middleName;

                            //Set full name
                            if (contact.givenName) {
                                tmpContact['full_name'] = contact.givenName + ' ' + contact.middleName;
                            }
                            else {
                                tmpContact['full_name'] = contact.middleName;
                            }
                        }
                    }
                    else {
                        if (contact?.familyName) {
                            tmpContact['lastname'] = contact?.familyName;

                            //Set full name
                            if (contact?.givenName) {
                                tmpContact['full_name'] = contact?.givenName + ' ' + contact?.familyName;
                            }
                            else {
                                tmpContact['full_name'] = contact?.familyName;
                            }
                        }
                        else {
                            //Set full name
                            tmpContact['full_name'] = contact?.givenName;
                        }
                    }

                    //Set phones number for contact
                    contact.phoneNumbers.map((phone) => {
                        const phoneTemp = phone?.number?.replace(/\s/g, '');

                        if (phone.label == 'mobile') {
                            if (tmpContact['mobile']) {
                                tmpContact['otherphone'] = phoneTemp;
                            }
                            else {
                                tmpContact['mobile'] = phoneTemp;
                            }
                        }
                        if (phone.label == 'work') {
                            tmpContact['phone'] = phoneTemp;
                        }
                        if (phone.label == 'home') {
                            tmpContact['homephone'] = phoneTemp;
                        }

                        if (phone.label == 'other') {
                            if (Global.validateOnlyNumber(phoneTemp)) {
                                if (tmpContact['mobile']) {
                                    tmpContact['otherphone'] = phoneTemp;
                                }
                                else {
                                    tmpContact['mobile'] = phoneTemp;
                                }
                            }
                        }
                    })

                    if (!tmpContact?.mobile) {
                        return;
                    }

                    //Set emails for contact
                    if (contact.emailAddresses.length > 0) {
                        tmpContact['email'] = contact.emailAddresses[0].email;

                        if (contact.emailAddresses.length > 1) {
                            tmpContact['secondaryemail'] = contact.emailAddresses[1].email;
                        }
                    }

                    //Set department and title for contact
                    if (contact.department) {
                        tmpContact['department'] = contact.department;
                    }

                    if (contact.jobTitle) {
                        tmpContact['title'] = contact.jobTitle;
                    }

                    if (contact.company) {
                        tmpContact['account_name'] = contact.company;
                    }

                    tmpContactList.push(tmpContact);
                }
            })
        }
        setFirstLoading(false);
        syncContacts(tmpContactList);

    }

    const syncContacts = (localContacts) => {
        setFirstLoading(true);

        var params = {
            RequestAction: 'SyncContacts',
            Data: {
                direction: "down",
                local_contacts: localContacts
            }
        };

        Global.callAPI(null, params, data => {

            if (parseInt(data.success) === 1) {

                let regex = contactsKeyWord.unUnicode().trim();
                let filteredNewContactList = data?.result?.new_contacts;
                let filteredUpdatedContactList = data?.result?.updated_contacts;

                try {
                    filteredNewContactList = data?.result?.new_contacts?.filter((contact) => (
                        ((contact.firstname != null) ? contact.firstname.unUnicodeMatch(regex) : '')
                        || ((contact.lastname != null) ? contact.lastname.unUnicodeMatch(regex) : '')
                        || ((contact.phone != null) ? contact.phone.unUnicodeMatch(regex) : '')
                        || ((contact.mobile != null) ? contact.mobile.unUnicodeMatch(regex) : '')
                        || ((contact.homephone != null) ? contact.homephone.unUnicodeMatch(regex) : '')
                        || ((contact.otherphone != null) ? contact.otherphone.unUnicodeMatch(regex) : '')
                        || ((contact.email != null) ? contact.email.unUnicodeMatch(regex) : '')
                        || ((contact.secondaryemail != null) ? contact.secondaryemail.unUnicodeMatch(regex) : '')
                        || ((contact.account_name != null) ? contact.account_name.unUnicodeMatch(regex) : '')
                    ));
                } catch (err) {
                }

                try {
                    filteredUpdatedContactList = data?.result?.updated_contacts?.filter((contact) => (
                        ((contact.firstname != null) ? contact.firstname.unUnicodeMatch(regex) : '')
                        || ((contact.lastname != null) ? contact.lastname.unUnicodeMatch(regex) : '')
                        || ((contact.phone != null) ? contact.phone.unUnicodeMatch(regex) : '')
                        || ((contact.mobile != null) ? contact.mobile.unUnicodeMatch(regex) : '')
                        || ((contact.homephone != null) ? contact.homephone.unUnicodeMatch(regex) : '')
                        || ((contact.otherphone != null) ? contact.otherphone.unUnicodeMatch(regex) : '')
                        || ((contact.email != null) ? contact.email.unUnicodeMatch(regex) : '')
                        || ((contact.secondaryemail != null) ? contact.secondaryemail.unUnicodeMatch(regex) : '')
                        || ((contact.account_name != null) ? contact.account_name.unUnicodeMatch(regex) : '')
                    ));
                } catch (err) {
                }

                setFirstLoading(false);
                setUpdatedContactList(filteredUpdatedContactList);
                setNewContactList(filteredNewContactList);
                setIsSelectAllNewContact(false);
                setIsSelectAllUpdatedContact(false);
                setSelectedNewContactList([]);
                setSelectedUpdatedContactList([]);
                setShowUpdateContactsModal(true);
            }
            else {
                setFirstLoading(false);
                Toast.show(getLabel('tools.sync_contacts_unsuccess_label'))
            }
        }, error => {
            setFirstLoading(false);
            Toast.show(getLabel('common.msg_connection_error'))
        });
    }

    function _renderViewContacts(): React.ReactNode {
        return (
            <Container>
                <Content
                    style={{
                        backgroundColor: Colors.white.white1
                    }}
                >
                    {/* Updated contact list */}
                    <Text style={[styles.titleContactsList, { marginLeft: 20, fontSize: 16, marginTop: 20, marginBottom: 10 }]}>
                        {getLabel('tools.updated_contacts_label')}
                    </Text>
                    <RadioButton
                        selected={isSelectAllUpdatedContact}
                        label={getLabel('tools.all_label')}
                        onSelect={() => { selectAllContacts('update') }}
                        style={{
                            ...styles.viewCheckBox,
                            ...styles.viewItemContact,
                            ...{ alignSelf: 'flex-start' }
                        }}
                    />
                    <Box
                        style={{
                            paddingLeft: 20
                        }}
                    >
                        {
                            updatedContactList.length > 0 && updatedContactList.map((uContact, idx) => {
                                return (
                                    <TouchableOpacity style={{ flexDirection: 'row', marginBottom: 5 }} key={idx} onPress={() => clickCheckbox(idx, 'update')}>
                                        <RadioButton
                                            selected={uContact?.checked}
                                            label={''}
                                            onSelect={() => { clickCheckbox(idx, 'update') }}
                                        />
                                        <Box>
                                            <Text fontSize={14} color='black1' fontWeight='bold'>{uContact?.full_name || [uContact?.lastname || '', uContact.firstname || ''].join(' ') || ''}</Text>
                                            <Text fontSize={14} color='black2' fontStyle='italic' lineHeight={20}>{uContact?.mobile || uContact?.phone || uContact?.homephone || uContact?.otherphone || ''}</Text>
                                            {
                                                uContact.email ? (
                                                    <Text fontSize={14} color='black2' fontStyle='italic'>{uContact?.email || ''}</Text>
                                                ) : null
                                            }
                                        </Box>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </Box>

                    {/* New contact list */}
                    <Text style={[styles.titleContactsList, { marginLeft: 20, fontSize: 16, marginTop: 20, marginBottom: 10 }]}>
                        {getLabel('tools.new_contacts_label')}
                    </Text>

                    <RadioButton
                        selected={isSelectAllNewContact}
                        label={getLabel('tools.all_label')}
                        onSelect={() => { selectAllContacts('new') }}
                        style={{
                            ...styles.viewCheckBox,
                            ...styles.viewItemContact,
                            ...{ alignSelf: 'flex-start' }
                        }}
                    />

                    <Box
                        style={{
                            paddingLeft: 20
                        }}
                    >
                        {
                            newContactList.length > 0 && newContactList.map((nContact, idx) => {
                                return (
                                    <TouchableOpacity style={{ flexDirection: 'row', marginBottom: 5 }} key={idx} onPress={() => clickCheckbox(idx, 'new')}>
                                        <RadioButton
                                            selected={nContact?.checked}
                                            label={''}
                                            onSelect={() => { clickCheckbox(idx, 'new') }}
                                        />
                                        <Box>
                                            <Text fontSize={14} color='black1' fontWeight='bold'>{nContact?.full_name || [nContact.lastname || '', nContact?.firstname || ''].join(' ') || ''}</Text>
                                            <Text fontSize={14} color='black2' fontStyle='italic' lineHeight={20}>{nContact?.mobile || nContact?.phone || nContact?.homephone || nContact?.otherphone || ''}</Text>
                                            {
                                                nContact.email ? (
                                                    <Text fontSize={14} color='black2' fontStyle='italic'>{nContact?.email || ''}</Text>
                                                ) : null
                                            }
                                        </Box>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </Box>

                </Content>

                {/* Undo */}
                {
                    showUndoButton && (
                        <Box
                            width={widthDevice}
                            height={50}
                            justifyContent='center'
                            alignItems='center'
                            flexDirection='row'
                        >
                            <Text
                                fontSize={14}
                            >
                                {getLabel('tools.sync_contact_label')}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsClickedUndoButton(true);
                                    setShowUndoButton(false);
                                }}
                            >
                                <Box
                                    height={30}
                                    justifyContent='center'
                                    alignItems='center'
                                    marginLeft='m'
                                >
                                    <Text
                                        fontSize={14}
                                        color='primary'
                                    >
                                        {getLabel('tools.btn_undo')}
                                    </Text>
                                </Box>
                            </TouchableOpacity>

                        </Box>

                    )
                }

                {/* Footer */}
                <Footer
                    style={{
                        alignItems: 'center',
                        backgroundColor: Colors.white.white3
                    }}
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                    >
                        <Box
                            backgroundColor='dangerous'
                            width={widthDevice * .3}
                            height={36}
                            borderRadius={4}
                            justifyContent='center'
                            alignItems='center'
                        >
                            <Text fontSize={14} color='white1'>{getLabel('common.btn_cancel')}</Text>
                        </Box>
                    </TouchableOpacity>

                    <SpaceHM />

                    <TouchableOpacity
                        onPress={() => {
                            if (selectedUpdatedContactList.length <= 0 && selectedNewContactList.length <= 0) {
                                const params: PARAMS_ALERT = {
                                    title: getLabel('tools.empty_selected_contacts_list_title', { module: getLabel('contact.title').toLowerCase() }),
                                    message: getLabel('tools.empty_selected_contacts_list_msg', { module: getLabel('contact.title').toLowerCase() }),
                                    actions: [
                                        {
                                            isCancel: true,
                                            label: getLabel('common.btn_ok')
                                        }
                                    ]
                                }

                                dispatch(showAlert?.(params));
                            }
                            else {
                                const params: PARAMS_ALERT = {
                                    title: getLabel('tools.confirm_import_contacts_title'),
                                    message: getLabel('tools.confirm_import_contacts_msg', { number: (selectedNewContactList.length + selectedUpdatedContactList.length) }),
                                    actions: [
                                        {
                                            isCancel: true,
                                            label: getLabel('common.btn_cancel')
                                        },
                                        {
                                            isCancel: false,
                                            isHighLight: true,
                                            label: getLabel('common.btn_ok'),
                                            onPress: () => {
                                                setShowUndoButton(true);
                                                setTimeout(() => {
                                                    if (!isClickedUndoButton) {
                                                        setShowUndoButton(false);

                                                        if (selectedUpdatedContactList.length > 0) {
                                                            updateContacts();
                                                        }
                                                        else if (selectedNewContactList.length > 0) {
                                                            addNewContacts();
                                                        }
                                                    }
                                                    else {
                                                        setIsClickedUndoButton(false);
                                                    }
                                                }, 3000)
                                            }
                                        }
                                    ]
                                }

                                dispatch(showAlert?.(params));
                            }
                        }}
                    >
                        <Box
                            backgroundColor='successful'
                            width={widthDevice * .3}
                            height={36}
                            borderRadius={4}
                            justifyContent='center'
                            alignItems='center'
                        >
                            <Text fontSize={14} color='white1'>{getLabel('common.btn_confirm')}</Text>
                        </Box>
                    </TouchableOpacity>
                </Footer>
            </Container>
        )
    }

    const checkPhoneIsSame = (phoneNumber, contact) => {
        let result = false;
        if (contact.phoneNumbers.length > 0) {
            contact.phoneNumbers.map((phone) => {
                if (phone.number.replace(/\s/g, '') == phoneNumber.replace(/\s/g, '')) {
                    result = true;
                }
            })
        }

        return result;
    }

    const checkEmailIsSame = (email, contact) => {
        let result = false;
        if (contact.emailAddresses.length > 0) {
            contact.emailAddresses.map((emailAddress) => {
                if (emailAddress.email == email) {
                    result = true;
                }
            })
        }

        return result;
    }

    const updateContacts = () => {
        setLoading(true);

        Contacts.getAll()
            .then((contacts) => {
                contacts.length > 0 && contacts.map((contact) => {
                    selectedUpdatedContactList.length > 0 && selectedUpdatedContactList.map((updatedContact, index) => {
                        if (checkPhoneIsSame(updatedContact.mobile, contact) || checkPhoneIsSame(updatedContact.phone, contact)
                            || checkPhoneIsSame(updatedContact.homephone, contact) || checkPhoneIsSame(updatedContact.otherphone, contact)
                            || checkEmailIsSame(updatedContact.email, contact) || checkEmailIsSame(updatedContact.secondaryemail, contact)) {
                            let someRecord = contact;

                            someRecord.givenName = updatedContact.firstname;
                            someRecord.familyName = updatedContact.lastname;
                            someRecord.middleName = '';
                            if (updatedContact.mobile && !checkPhoneIsSame(updatedContact.mobile, contact)) {
                                someRecord.phoneNumbers.push({
                                    label: 'mobile',
                                    number: updatedContact.mobile
                                })
                            }

                            if (updatedContact.phone && !checkPhoneIsSame(updatedContact.phone, contact)) {
                                someRecord.phoneNumbers.push({
                                    label: 'work',
                                    number: updatedContact.phone
                                })
                            }

                            if (updatedContact.homephone && !checkPhoneIsSame(updatedContact.homephone, contact)) {
                                someRecord.phoneNumbers.push({
                                    label: 'home',
                                    number: updatedContact.homephone
                                })
                            }

                            if (updatedContact.otherphone && !checkPhoneIsSame(updatedContact.otherphone, contact)) {
                                someRecord.phoneNumbers.push({
                                    label: 'mobile',
                                    number: updatedContact.otherphone
                                })
                            }

                            if (updatedContact.email && !checkEmailIsSame(updatedContact.email, contact)) {
                                someRecord.emailAddresses.push({
                                    label: 'email',
                                    email: updatedContact.email
                                })
                            }

                            if (updatedContact.secondaryemail && !checkEmailIsSame(updatedContact.secondaryemail, contact)) {
                                someRecord.emailAddresses.push({
                                    label: 'secondaryemail',
                                    email: updatedContact.secondaryemail
                                })
                            }
                            setLoading(false);
                            someRecord.note = '';

                            if (Platform.OS == 'ios') {
                                Contacts.updateContact(someRecord)
                                    .then(() => {
                                        Toast.show(getLabel('tools.sync_contacts_success_label'));
                                        setTimeout(() => {
                                            navigation.goBack()
                                        }, 1500);
                                    })
                                    .catch(() => { Toast.show(getLabel('tools.sync_contacts_error_label')) })
                            }
                            else {
                                check(
                                    PERMISSIONS.ANDROID.WRITE_CONTACTS
                                )
                                    .then((res) => {
                                        Contacts.updateContact(someRecord)
                                            .then(() => {
                                                Toast.show(getLabel('tools.sync_contacts_success_label'));
                                                setTimeout(() => {
                                                    navigation.goBack()
                                                }, 1500);
                                            })
                                            .catch(() => { Toast.show(getLabel('tools.sync_contacts_error_label')) })
                                    })
                                    .catch((err) => {
                                        Toast.show(getLabel('tools.sync_contacts_error_label'))

                                    })
                            }
                            setLoading(false);
                            if (index == selectedUpdatedContactList.length - 1) {
                                setIsSelectAllUpdatedContact(false);
                                setSelectedUpdatedContactList([]);
                                setUpdatedContactList([]);
                                setContactsKeyWord('');

                                if (selectedNewContactList.length <= 0) {
                                    setLoading(false);
                                    setShowUpdateContactsModal(false);
                                }
                            }
                        }
                        else {
                            setLoading(false);
                        }
                    })
                })
            })
            .catch(err => {
                setLoading(false);
                Toast.show(getLabel('tools.sync_contacts_error_label'))
            })

    }

    const addNewContacts = () => {
        setLoading(true);

        selectedNewContactList.length > 0 && selectedNewContactList.map((newContact, index) => {
            let newPerson = {
                givenName: newContact.lastname,
                familyName: newContact.firstname,
                phoneNumbers: [],
                emailAddresses: []
            }

            if (newContact.mobile) {
                newPerson.phoneNumbers.push({
                    label: 'mobile',
                    number: newContact.mobile
                })
            }

            if (newContact.phone) {
                newPerson.phoneNumbers.push({
                    label: 'work',
                    number: newContact.phone
                })
            }

            if (newContact.homephone) {
                newPerson.phoneNumbers.push({
                    label: 'home',
                    number: newContact.homephone
                })
            }

            if (newContact.otherphone) {
                newPerson.phoneNumbers.push({
                    label: 'mobile',
                    number: newContact.otherphone
                })
            }

            if (newContact.email) {
                newPerson.emailAddresses.push({
                    label: 'email',
                    email: newContact.email
                })
            }

            if (newContact.secondaryemail) {
                newPerson.emailAddresses.push({
                    label: 'secondaryemail',
                    email: newContact.secondaryemail
                })
            }

            if (Platform.OS == 'ios') {
                Contacts.addContact(newPerson)
                    .then(() => {
                        Toast.show(getLabel('tools.sync_contacts_success_label'));
                        setTimeout(() => {
                            navigation.goBack()
                        }, 1500);
                    })
                    .catch(err => {
                        Toast.show(getLabel('tools.sync_contacts_error_label'))
                    })
            }
            else {
                request(PERMISSIONS.ANDROID.WRITE_CONTACTS)
                    .then((res) => {
                        if (res == 'granted') {
                            Contacts.addContact(newPerson)
                                .then(() => {
                                    Toast.show(getLabel('tools.sync_contacts_success_label'));
                                    setTimeout(() => {
                                        navigation.goBack()
                                    }, 1500);
                                })
                                .catch(err => {
                                    Toast.show(getLabel('tools.sync_contacts_error_label'))

                                })
                        }
                        else {
                            Toast.show(getLabel('tools.sync_contacts_error_label'))
                        }

                    })
                    .catch((err) => {
                        Toast.show(getLabel('tools.sync_contacts_error_label'))
                    })
            }

            if (index == selectedNewContactList.length - 1) {
                setIsSelectAllNewContact(false);
                setIsSelectAllUpdatedContact(false);
                setSelectedNewContactList([]);
                setSelectedUpdatedContactList([]);
                setUpdatedContactList([]);
                setNewContactList([]);
                setLoading(false);
                setContactsKeyWord('');
            }
        })
    }

    const selectAllContacts = (type?: 'new' | 'update') => {
        if (type == 'update') {
            updatedContactList.map((item, i) => {
                item.checked = !isSelectAllUpdatedContact;
            });

            setIsSelectAllUpdatedContact(!isSelectAllUpdatedContact);
            setUpdatedContactList(updatedContactList);
            setSelectedUpdatedContactList(!isSelectAllUpdatedContact ? updatedContactList : []);
        }
        else {
            newContactList.map((item, i) => {
                item.checked = !isSelectAllNewContact;
            });

            setIsSelectAllNewContact(!isSelectAllNewContact);
            setNewContactList(newContactList);
            setSelectedNewContactList(!isSelectAllNewContact ? newContactList : []);
        }
    }

    const clickCheckbox = (index: number, type?: 'new' | 'update') => {
        let contactsList = (type == 'update') ? updatedContactList : newContactList;
        let selectedContactsList = [];

        contactsList.map((item, i) => {
            if (i === index) {
                item.checked = !item.checked;
            }
        });

        contactsList.map((item, i) => {
            if (item.checked) {
                selectedContactsList.push(item);
            }
        });

        if (type == 'update') {
            setUpdatedContactList(contactsList);
            setSelectedUpdatedContactList(selectedContactsList);
            setIsSelectAllUpdatedContact(selectedContactsList.length == contactsList.length ? true : false);
        }
        else {
            setNewContactList(contactsList);
            setSelectedNewContactList(selectedContactsList);
            setIsSelectAllNewContact(selectedContactsList.length == contactsList.length ? true : false);
        }

    }

    return (
        <Container>
            <LargeHeader>
                <Header noBorder
                >
                    <Body>
                        <Title allowFontScaling={true} >{getLabel('tools.btn_sync_down')}</Title>
                    </Body>
                    <Right style={{maxWidth: 80}}>
                        <TouchableHighlight
                            activeOpacity={.2}
                            underlayColor={Colors.white.white2}
                            style={
                                styles.btnClose
                            }
                            onPress={() => {
                                navigation.goBack();
                            }}
                        >
                            <Icon name='times' style={{ fontSize: 20 }} />
                        </TouchableHighlight>
                    </Right>
                </Header>

                <Header noBorder>
                    <Body>
                        <Box
                            backgroundColor='white3'
                            width={widthResponse - 32}
                            height={44}
                            borderRadius={4}
                            flexDirection='row'
                            alignItems='center'
                        >
                            <Box
                                width={30}
                                justifyContent='center'
                                alignItems='center'
                            >
                                <Icon name='search' size={14} color={Colors.black.black2} />

                            </Box>
                            <Input
                                placeholder={getLabel('common.keyword_input_place_holder')}
                                returnKeyType='done'
                                value={contactsKeyWord}
                                clearButtonMode='while-editing'
                                onChangeText={(value) => {
                                    setContactsKeyWord(value);
                                }}
                            />
                        </Box>
                    </Body>
                </Header>
            </LargeHeader>
            <LoadingList loading={firstLoading}/>
            {permissionBlocked && _renderViewPermissionBlock()}
            {permissionDenied && _renderViewPermissionDenied()}
            {showUpdateContactsModal && _renderViewContacts()}
            <IndicatorLoading loading={loading} />
        </Container>
    )
}

const styles = StyleSheet.create({
    btnClose: {
        width: 36,
        height: 36,
        borderRadius: 36 / 2,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    titleContactsList: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.functional.primary
    },
    viewCheckBox: {
        alignSelf: 'center',
        justifyContent: 'center',
        marginLeft: 10
    },
    viewContentContact: {
        alignSelf: 'center',
        justifyContent: 'center',
        marginLeft: 20
    },
    viewItemContact: {
        flexDirection: 'row',
        padding: 10
    },
})


