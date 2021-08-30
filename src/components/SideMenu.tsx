import { Menu } from 'antd';
import { withRouter } from 'react-router-dom';

import {
  defaultOpenedMenu,
  defaultOpenedSubMenu,
  routes,
} from '../routes';

const { SubMenu } = Menu;

const SideMenu = withRouter(({ history }) => {
  return (
    <Menu
      theme="dark"
      defaultSelectedKeys={defaultOpenedSubMenu}
      selectedKeys={[history.location.pathname]}
      defaultOpenKeys={defaultOpenedMenu}
      mode="inline"
    >
      {routes.map(({ Icon, title, subItems }) => (
        <SubMenu key={title} icon={<Icon />} title={title}>
          {subItems.map(({ title, path }) => (
            <Menu.Item key={path} onClick={() => history.push(path)}>
              {title}
            </Menu.Item>
          ))}
        </SubMenu>
      ))}
    </Menu>
  );
});

export default SideMenu;
