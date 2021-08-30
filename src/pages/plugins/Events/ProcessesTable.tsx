import { Progress, Table, Tag } from 'antd';
import _ from 'lodash';

type TableRecord = {
  duration: number;
  event: string;
  listenerName: string;
  pid: number;
  filePath: string;
  calls: number;
  worker: boolean;
  waitable: boolean;
};

type Props = {
  data: Array<TableRecord>;
  drawNestedTable: (record: TableRecord) => React.ReactNode;
};

const ProcsTable: React.FC<Props> = (props) => {
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
    key: `${item.filePath}:${item.pid}`,
    type: item.worker ? 'worker' : 'master',
  }));

  const columns = [
    {
      title: 'File',
      dataIndex: 'filePath',
      key: 'filePath',
    },
    {
      title: 'PID',
      dataIndex: 'pid',
      key: 'pid',
    },
    {
      title: 'Number of calls',
      dataIndex: 'calls',
      key: 'calls',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      align: 'center' as any,
      render: (tag: string) => {
        const color = tag === 'master' ? 'green' : 'geekblue';

        return (
          <Tag color={color} key={tag}>
            {tag.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      width: '50%',
      title: waitable
        ? 'Range between start and end of all plugins'
        : 'Sum duration of plugins',
      dataIndex: 'duration',
      key: 'duration',
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
        pagination={{ pageSize: 50 }}
        size="small"
        columns={columns}
        dataSource={_.chain(data)
          .sortBy('duration')
          .reverse()
          .value()}
        expandable={{ expandedRowRender: props.drawNestedTable }}
      />
    </div>
  );
};

export default ProcsTable;
