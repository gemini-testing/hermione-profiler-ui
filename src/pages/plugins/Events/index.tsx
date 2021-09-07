import { PageHeader } from 'antd';
import { Typography } from 'antd';
import _ from 'lodash';

import { usePluginsState } from '../../../store/plugins';

import EventsTable from './EventsTable';
import PluginsTable from './PluginsTable';
import ProcessesTable from './ProcessesTable';
import styles from './index.module.scss';

const Events: React.FC = () => {
  const state = usePluginsState();
  const dataMap = state.getMap();

  if (_.isEmpty(dataMap)) {
    return (
      <Typography.Text type="danger">Nothing to show</Typography.Text>
    );
  }

  return (
    <div className={styles.events}>
      {dataMap.list.map((listenerName) => {
        const listenerslevel = dataMap.map[listenerName];

        return (
          <div key={listenerName}>
            <PageHeader title={listenerName} subTitle="(listener)" />
            <EventsTable
              data={listenerslevel.list}
              drawNestedTable={(record) => {
                const eventsLevel = listenerslevel.map[record.event];

                return (
                  <ProcessesTable
                    data={eventsLevel.list}
                    drawNestedTable={(record) => {
                      const pluginsLevel =
                        eventsLevel.map[
                          `${record.filePath}:${record.pid}`
                        ];

                      return (
                        <PluginsTable
                          data={pluginsLevel.list}
                          map={pluginsLevel.map}
                          drawNestedTable={(record) => <div>KEK</div>}
                        />
                      );
                    }}
                  />
                );
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Events;
