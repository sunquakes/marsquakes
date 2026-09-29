package org.jeecg.modules.agenttest.controller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jeecg.common.api.vo.Result;
import org.jeecg.common.system.query.QueryGenerator;
import org.jeecg.common.system.query.QueryRuleEnum;
import org.jeecg.common.util.oConvertUtils;
import org.jeecg.modules.agenttest.entity.AgentE2ENoteV2;
import org.jeecg.modules.agenttest.service.IAgentE2ENoteV2Service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.extern.slf4j.Slf4j;

import org.jeecgframework.poi.excel.ExcelImportUtil;
import org.jeecgframework.poi.excel.def.NormalExcelConstants;
import org.jeecgframework.poi.excel.entity.ExportParams;
import org.jeecgframework.poi.excel.entity.ImportParams;
import org.jeecgframework.poi.excel.view.JeecgEntityExcelView;
import org.jeecg.common.system.base.controller.JeecgController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import com.alibaba.fastjson.JSON;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import org.jeecg.common.aspect.annotation.AutoLog;
import org.apache.shiro.authz.annotation.RequiresPermissions;
 /**
 * @Description: AI E2E Note
 * @Author: jeecg-boot
 * @Date:   2026-09-29
 * @Version: V1.0
 */
@Tag(name="AI E2E Note")
@RestController
@RequestMapping("/agenttest/agentE2ENoteV2")
@Slf4j
public class AgentE2ENoteV2Controller extends JeecgController<AgentE2ENoteV2, IAgentE2ENoteV2Service> {
	@Autowired
	private IAgentE2ENoteV2Service agentE2ENoteV2Service;
	
	/**
	 * 分页列表查询
	 *
	 * @param agentE2ENoteV2
	 * @param pageNo
	 * @param pageSize
	 * @param req
	 * @return
	 */
	//@AutoLog(value = "AI E2E Note-分页列表查询")
	@Operation(summary="AI E2E Note-分页列表查询")
	@GetMapping(value = "/list")
	public Result<IPage<AgentE2ENoteV2>> queryPageList(AgentE2ENoteV2 agentE2ENoteV2,
								   @RequestParam(name="pageNo", defaultValue="1") Integer pageNo,
								   @RequestParam(name="pageSize", defaultValue="10") Integer pageSize,
								   HttpServletRequest req) {


        QueryWrapper<AgentE2ENoteV2> queryWrapper = QueryGenerator.initQueryWrapper(agentE2ENoteV2, req.getParameterMap());
		Page<AgentE2ENoteV2> page = new Page<AgentE2ENoteV2>(pageNo, pageSize);
		IPage<AgentE2ENoteV2> pageList = agentE2ENoteV2Service.page(page, queryWrapper);
		return Result.OK(pageList);
	}
	
	/**
	 *   添加
	 *
	 * @param agentE2ENoteV2
	 * @return
	 */
	@AutoLog(value = "AI E2E Note-添加")
	@Operation(summary="AI E2E Note-添加")
	@RequiresPermissions("agenttest:agent_e2e_note_v2:add")
	@PostMapping(value = "/add")
	public Result<String> add(@RequestBody AgentE2ENoteV2 agentE2ENoteV2) {
		agentE2ENoteV2Service.save(agentE2ENoteV2);

		return Result.OK("添加成功！");
	}
	
	/**
	 *  编辑
	 *
	 * @param agentE2ENoteV2
	 * @return
	 */
	@AutoLog(value = "AI E2E Note-编辑")
	@Operation(summary="AI E2E Note-编辑")
	@RequiresPermissions("agenttest:agent_e2e_note_v2:edit")
	@RequestMapping(value = "/edit", method = {RequestMethod.PUT,RequestMethod.POST})
	public Result<String> edit(@RequestBody AgentE2ENoteV2 agentE2ENoteV2) {
		agentE2ENoteV2Service.updateById(agentE2ENoteV2);
		return Result.OK("编辑成功!");
	}
	
	/**
	 *   通过id删除
	 *
	 * @param id
	 * @return
	 */
	@AutoLog(value = "AI E2E Note-通过id删除")
	@Operation(summary="AI E2E Note-通过id删除")
	@RequiresPermissions("agenttest:agent_e2e_note_v2:delete")
	@DeleteMapping(value = "/delete")
	public Result<String> delete(@RequestParam(name="id",required=true) String id) {
		agentE2ENoteV2Service.removeById(id);
		return Result.OK("删除成功!");
	}
	
	/**
	 *  批量删除
	 *
	 * @param ids
	 * @return
	 */
	@AutoLog(value = "AI E2E Note-批量删除")
	@Operation(summary="AI E2E Note-批量删除")
	@RequiresPermissions("agenttest:agent_e2e_note_v2:deleteBatch")
	@DeleteMapping(value = "/deleteBatch")
	public Result<String> deleteBatch(@RequestParam(name="ids",required=true) String ids) {
		this.agentE2ENoteV2Service.removeByIds(Arrays.asList(ids.split(",")));
		return Result.OK("批量删除成功!");
	}
	
	/**
	 * 通过id查询
	 *
	 * @param id
	 * @return
	 */
	//@AutoLog(value = "AI E2E Note-通过id查询")
	@Operation(summary="AI E2E Note-通过id查询")
	@GetMapping(value = "/queryById")
	public Result<AgentE2ENoteV2> queryById(@RequestParam(name="id",required=true) String id) {
		AgentE2ENoteV2 agentE2ENoteV2 = agentE2ENoteV2Service.getById(id);
		if(agentE2ENoteV2==null) {
			return Result.error("未找到对应数据");
		}
		return Result.OK(agentE2ENoteV2);
	}

    /**
    * 导出excel
    *
    * @param request
    * @param agentE2ENoteV2
    */
    @RequiresPermissions("agenttest:agent_e2e_note_v2:exportXls")
    @RequestMapping(value = "/exportXls")
    public ModelAndView exportXls(HttpServletRequest request, AgentE2ENoteV2 agentE2ENoteV2) {
        return super.exportXls(request, agentE2ENoteV2, AgentE2ENoteV2.class, "AI E2E Note");
    }

    /**
      * 通过excel导入数据
    *
    * @param request
    * @param response
    * @return
    */
    @RequiresPermissions("agenttest:agent_e2e_note_v2:importExcel")
    @RequestMapping(value = "/importExcel", method = RequestMethod.POST)
    public Result<?> importExcel(HttpServletRequest request, HttpServletResponse response) {
        return super.importExcel(request, response, AgentE2ENoteV2.class);
    }

}
