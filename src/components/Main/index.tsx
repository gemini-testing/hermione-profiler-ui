import path from 'path';

import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  LoadingOutlined,
} from '@ant-design/icons';
import { notification, Spin, Typography } from 'antd';
import { Button, Layout } from 'antd';
import P from 'bluebird';
import { uniq } from 'lodash';
import _ from 'lodash';
import { useEffect } from 'react';
import { useState } from 'react';

import { usePluginsState } from '../../store/plugins';
import { ProfilerStatsItem } from '../../store/plugins/types';
import { loadFile } from '../../utils/loader';
import Loader from '../Loader';
import SideMenu from '../SideMenu';

import styles from './index.module.scss';

const { Content, Footer, Sider } = Layout;
const declaration = (
  window as unknown as {
    HERMIONE_PROFILER_FILES_DECLARATION: { plugins: string[] };
  }
).HERMIONE_PROFILER_FILES_DECLARATION;
const files = uniq(declaration.plugins);

const FILE_LOADER_DELAY_BEFORE_UPDATES = 1000;
const FILE_LOADER_DELAY_BEFORE_CLOSE = 1000;
const FILE_LOADER_DELAY_BETWEEN_UPDATES = 10;
const LOADER_ID = 'loader-progress';

const MainLayout: React.FC = (props) => {
  let animationChain = P.delay(FILE_LOADER_DELAY_BEFORE_UPDATES);
  const [collapsed, setCollapsed] = useState(false);
  const state = usePluginsState();
  const updateFileListComponent = () => {
    const progressItems = state.getSources().map((source) => {
      const Icon = {
        loading: <LoadingOutlined twoToneColor="blue" />,
        empty: <LoadingOutlined />,
        loaded: <CheckCircleTwoTone twoToneColor="#52c41a" />,
        error: <CloseCircleTwoTone twoToneColor="red" />,
      }[source.loadState];

      return (
        <div key={source.filePath}>
          <Spin indicator={Icon} /> Loading{' '}
          <Typography.Text strong>
            {path.basename(source.filePath)}
          </Typography.Text>{' '}
          / {source.rowsCount} rows
        </div>
      );
    });

    animationChain = animationChain
      .delay(FILE_LOADER_DELAY_BETWEEN_UPDATES)
      .then(() => {
        notification.open({
          description: progressItems,
          message: 'Downloads:',
          duration: 0,
          key: LOADER_ID,
        });
      });
  };
  const hideFileListComponent = () => {
    return animationChain
      .delay(FILE_LOADER_DELAY_BEFORE_CLOSE)
      .then(() => {
        notification.close(LOADER_ID);
      });
  };
  const finishLoading = () => {
    hideFileListComponent().then(() => {
      state.buildMap();
      state.setLoadedState();
    });
  };

  useEffect(() => {
    if (!state.shouldFetch()) {
      return;
    }

    state.setLoadingState();

    files.forEach((filePath) => {
      state.addUntrackedSource(filePath);

      const loader = loadFile<ProfilerStatsItem>(filePath);

      loader
        .on('chunk', (receivedItems) => {
          state.addUntrackedItems(filePath, receivedItems);
          updateFileListComponent();
        })
        .on('start', () => {
          state.setUntrackedLoadingSourceState(filePath);
          updateFileListComponent();
        })
        .on('error', (msg: string) => {
          state.setUntrackedErrorSourceState(filePath, msg);
          updateFileListComponent();

          if (state.isAllSourcesLoaded()) {
            finishLoading();
          }
        })
        .on('complete', () => {
          state.setUntrackedCompleteSourceState(filePath);
          updateFileListComponent();

          if (state.isAllSourcesLoaded()) {
            finishLoading();
          }
        });
    });
  });

  const errors = state.getErrors();

  if (!_.isEmpty(errors)) {
    console.error('Unable to load files:', errors);

    errors.forEach(({ filePath, error }) => {
      notification.error({
        message: filePath,
        description: error,
        placement: 'topRight',
        key: filePath,
      });
    });
  }

  const content = state.isLoading() ? <Loader /> : props.children;

  return (
    <Layout className={styles.container}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={() => setCollapsed(!collapsed)}
      >
        <SideMenu />
      </Sider>
      <Layout className={styles.rightLayout}>
        <Content className={styles.contentContainer}>
          <div className={styles.content}>{content}</div>
        </Content>
        <Footer className={styles.footer}>
          <Button
            type="link"
            href="https://github.com/gemini-testing/hermione"
          >
            Profiler for hermione
          </Button>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
