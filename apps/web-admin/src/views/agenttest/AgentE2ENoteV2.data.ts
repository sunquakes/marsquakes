import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '??',
    align:"center",
    sorter: true,
    dataIndex: 'title'
   },
   {
    title: '??',
    align:"center",
    dataIndex: 'content'
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
	{
      label: "??",
      field: 'title',
      component: 'Input',
      //colProps: {span: 6},
 	},
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '??',
    field: 'id',
    component: 'Input',
  },
  {
    label: '??',
    field: 'title',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入??!'},
          ];
     },
  },
  {
    label: '??',
    field: 'content',
    component: 'InputTextArea',
  },
];

// 高级查询数据
export const superQuerySchema = {
  title: {title: '??',order: 1,view: 'text', type: 'string',},
  content: {title: '??',order: 2,view: 'textarea', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}