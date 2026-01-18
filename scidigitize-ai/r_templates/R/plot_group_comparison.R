#' Group Comparison Module
#' 
#' Generates Box/Violin/Bar plots with statistical comparisons.
#' Dependencies: ggpubr, rstatix

library(ggpubr)

source("R/theme_utils.R")
source("R/io_utils.R")

#' Draw Group Comparison Plot
#'
#' @param config_list Configuration list.
#' @return A ggplot object.
#' @export
draw_group_comparison <- function(config_list) {
  validate_config(config_list)
  df <- parse_data_payload(config_list$data_payload)
  style <- config_list$style_config
  
  # x: Grouping variable, y: Continuous variable
  x_var <- config_list$model_config$x
  y_var <- config_list$model_config$y
  
  chart_type <- if(!is.null(style$type)) style$type else "boxplot"
  add_jitter <- if(!is.null(style$add_jitter) && style$add_jitter) "jitter" else "none"
  
  # Palette
  journal_theme <- if(!is.null(style$journal_theme)) style$journal_theme else "NEJM"
  palette <- get_palette(journal_theme)
  
  # Base Plot
  p <- NULL
  if (chart_type == "boxplot") {
    p <- ggboxplot(df, x = x_var, y = y_var,
                   color = x_var, palette = palette,
                   add = add_jitter)
  } else if (chart_type == "violin") {
    p <- ggviolin(df, x = x_var, y = y_var,
                  fill = x_var, palette = palette,
                  add = c("boxplot", add_jitter))
  } else if (chart_type == "barplot") {
    p <- ggbarplot(df, x = x_var, y = y_var,
                   fill = x_var, palette = palette,
                   add = "mean_se")
  }
  
  # Statistics
  stat_method <- if(!is.null(style$stat_method)) style$stat_method else "t.test"
  
  p <- p + stat_compare_means(method = stat_method, 
                              label = "p.format") # or p.signif
  
  # Theming
  p <- p + get_journal_theme(journal_theme)
  
  return(p)
}
