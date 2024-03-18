import { FunctionComponent } from "react";
import styles from './LeftSideBar.module.scss'
import { Space, Typography } from "antd";
import { imagesData } from "../data/imagesData";

const {Text} = Typography
const LeftSideBar: FunctionComponent = () => {
    
    return (
        <div>
            <div className={styles.header}>
                <p>Mind SC</p>
            </div>

            <Space direction="vertical" className={styles.imageList}>
                {
                    imagesData.map((item) => {
                        return (
                            <Text key={item.id}>{item.name}</Text>
                        )
                    })
                }
            </Space>
        </div>
    )
}

export default LeftSideBar