package org.jeecg.modules.agenttest.entity;

import java.io.Serializable;
import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.math.BigDecimal;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableLogic;
import org.jeecg.common.constant.ProvinceCityArea;
import org.jeecg.common.util.SpringContextUtils;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.format.annotation.DateTimeFormat;
import org.jeecgframework.poi.excel.annotation.Excel;
import org.jeecg.common.aspect.annotation.Dict;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * @Description: AI E2E Note
 * @Author: jeecg-boot
 * @Date:   2026-09-29
 * @Version: V1.0
 */
@Data
@TableName("agent_e2e_note_v2")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@Schema(description="AI E2E Note")
public class AgentE2ENoteV2 implements Serializable {
    private static final long serialVersionUID = 1L;

	/**??*/
	@TableId(type = IdType.ASSIGN_ID)
    @Schema(description = "??")
    private java.lang.String id;
	/**??*/
	@Excel(name = "??", width = 15)
    @Schema(description = "??")
    private java.lang.String title;
	/**??*/
	@Excel(name = "??", width = 15)
    @Schema(description = "??")
    private java.lang.String content;
}
