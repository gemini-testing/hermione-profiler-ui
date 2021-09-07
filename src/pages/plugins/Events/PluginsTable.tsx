import { Bar } from '@ant-design/charts';
import { Collapse, Progress, Table } from 'antd';
import _ from 'lodash';

import styles from './index.module.scss';

const ALLOWED_DIAGRAM_CONTAINER_HEIGHT = 500; //px

type TableRecord = {
  duration: number;
  pluginName: string;
  calls: number;
  waitable: boolean;
};

type TableMap = {
  [callName: string]: {
    title: string;
    range: number[];
    duration: number;
  };
};

type Props = {
  data: Array<TableRecord>;
  map: TableMap;
  drawNestedTable: (record: TableRecord) => React.ReactNode;
};

type DiagramProps = {
  data: TableMap;
  height: number;
  scroll: boolean;
};

const Diagram: React.FC<DiagramProps> = (props) => {
  const barItems = _(props.data)
    .values()
    .orderBy('start')
    .map((item) => ({
      value: item.range,
      label: item.title,
      duration: item.duration,
    }))
    .value();

  const config = {
    height: props.height,
    autoFit: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderer: 'svg' as any,
    data: barItems,
    isRange: true,
    xField: 'value',
    yField: 'label',
    color: '#1c90ff',
    tooltip: false,
    barStyle: {
      stroke: '#1c90ff',
      lineWidth: 1,
    },
    /* eslint-disable @typescript-eslint/no-explicit-any */
    xAxis: {
      label: {
        formatter: (date: number) =>
          `${date / 1000}sec / ${Math.round(date / 1000 / 60)}min`,
      },
    } as any,
    label: {
      content: (item: TableRecord) => `${item.duration} ms`,
      position: 'right',
      layout: [{ type: 'adjust-color' }],
    } as any,
    /* eslint-enable @typescript-eslint/no-explicit-any */
  };

  if (props.scroll) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config as any).scrollbar = {
      type: 'vertical',
      width: 10,
      categorySize: 30,
      animate: false,
    };
  }

  return <Bar {...config} />;
};

const PluginsTable: React.FC<Props> = (props) => {
  const maxDuration = _.chain(props.data)
    .map('duration')
    .max()
    .value();
  const waitable = _.chain(props.data)
    .first()
    .get('waitable')
    .value();
  const data = props.data.map((item) => ({
    ...item,
    key: item.pluginName,
  }));
  const itemHeight = 30;
  const barItemsCount = _.values(props.map).length;
  const containerHeight = barItemsCount * itemHeight;
  const shouldShowScroll =
    containerHeight > ALLOWED_DIAGRAM_CONTAINER_HEIGHT;
  const diagramContainerHeight = shouldShowScroll
    ? ALLOWED_DIAGRAM_CONTAINER_HEIGHT
    : containerHeight;

  const columns = [
    {
      title: 'Plugin name',
      dataIndex: 'pluginName',
      key: 'pluginName',
    },
    {
      title: 'Number of calls',
      dataIndex: 'calls',
      key: 'calls',
    },
    {
      width: '50%',
      title: waitable
        ? 'Range between start and end of all calls'
        : 'Sum duration of plugin calls',
      key: 'duration',
      dataIndex: 'duration',
      render: (duration: number) => {
        const percent = (100 / maxDuration) * duration - 1;

        return (
          <Progress
            percent={percent}
            strokeWidth={25}
            strokeLinecap="square"
            format={() => `${duration} ms`}
          />
        );
      },
    },
  ];

  return (
    <div>
      <Table
        bordered
        pagination={false}
        size="small"
        columns={columns}
        dataSource={_.sortBy(data, 'duration').reverse()}
      />
      <Collapse className={styles.pluginsCollapse}>
        <Collapse.Panel header="Timeline diagram" key="diagram">
          <div
            className={styles.pluginsDiagramWrapper}
            style={{ height: diagramContainerHeight }}
          >
            <div className={styles.pluginsDiagramContaner}>
              <Diagram
                data={props.map}
                height={diagramContainerHeight}
                scroll={shouldShowScroll}
              />
            </div>
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

export default PluginsTable;
