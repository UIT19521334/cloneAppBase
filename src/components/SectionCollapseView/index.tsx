import React, { useState } from "react";
import { Colors } from "../../themes/colors/Colors";
import { Box } from "../../themes/themes";
import { getLabel, widthResponse } from "../../utils/commons/commons";
import { BoxButton, NBText, NText } from "../CustomComponentView";

const SectionCollapseView = ({ initState, title, children }) => {
    const [isShow, setShow] = useState(initState);
    return (
        <Box
            backgroundColor='white1'
            justifyContent='space-between'
            alignItems='center'
            borderWidth={0.4}
            borderColor='white4'
        >
            <BoxButton
                row
                justifyContent='space-between'
                height={42}
                width={widthResponse}
                alignItems='center'
                paddingHorizontal={12}
                border={.4}
                onPress={() => { setShow(!isShow) }}
            >
                <NBText allowFontScaling={true} >{title}</NBText>
                <NText allowFontScaling={true}  color={Colors.functional.primary}>{isShow ? getLabel('common.btn_hide') : getLabel('common.btn_show')}</NText>
            </BoxButton>
            {
                isShow ?
                    (
                        <>
                            { children}
                        </>
                    )
                    : null
            }

        </Box>
    );
}

export default SectionCollapseView;