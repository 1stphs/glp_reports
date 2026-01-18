#' Consensus & Flow Module
#' 
#' Generates Sankey / Alluvial diagrams.
#' Dependencies: ggalluvial, ggplot2

library(ggplot2)
library(ggalluvial)

source("R/theme_utils.R")
source("R/io_utils.R")

#' Draw Sankey/Alluvial Plot
#'
#' @param config_list Configuration list.
#' @return A ggplot object.
#' @export
draw_flow_plot <- function(config_list) {
  validate_config(config_list)
  df <- parse_data_payload(config_list$data_payload)
  style <- config_list$style_config
  
  # Data format for ggalluvial can be "wide" or "long".
  # Let's assume "Wide" format:
  # Col1: Stage1, Col2: Stage2, Col3: Freq (optional)
  
  # Check if frequency weights exist
  has_freq <- "freq" %in% names(df)
  
  # Identification of axis columns: all columns that are not 'freq'
  axis_cols <- setdiff(names(df), "freq")
  
  # Start Plot
  # ggalluvial requires is_alluvia form usually
  
  p <- ggplot(df, aes(axis1 = .data[[axis_cols[1]]], axis2 = .data[[axis_cols[2]]]))
  
  if (has_freq) {
    p <- p + geom_alluvium(aes(y = freq), width = 1/12) +
             geom_stratum(aes(y = freq), width = 1/12, fill = "black", color = "grey")
  } else {
    p <- p + geom_alluvium(aes(fill = .data[[axis_cols[1]]]), width = 1/12) +
             geom_stratum(width = 1/12, fill = "grey", color = "black")
  }

  p <- p + 
    geom_label(stat = "stratum", aes(label = after_stat(stratum))) +
    scale_x_discrete(limits = c("Stage 1", "Stage 2"), expand = c(.05, .05)) +
    get_journal_theme("NEJM") +
    theme(legend.position = "none") # Sankey usually self-explanatory?
  
  return(p)
}
