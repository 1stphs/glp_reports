#' Swimmer Plot Module
#' 
#' Generates Longitudinal Patient Timelines (Swimmer Plots).
#' Dependencies: ggplot2, dplyr

library(ggplot2)
library(dplyr)

source("R/theme_utils.R")
source("R/io_utils.R")

#' Draw Swimmer Plot
#'
#' @param config_list Configuration list.
#' @return A ggplot object.
#' @export
draw_swimmer_plot <- function(config_list) {
  validate_config(config_list)
  
  # Swimmer plot structure usually involves two datasets:
  # 1. Bars (Durations of treatment/stages)
  # 2. Points (Events like CR, PR, Progression)
  
  # We expect data_payload to contain 'bars' and 'events' objects ideally, 
  # or a single flat file we parse. Let's assume a simplified flat structure for MVP:
  # columns: patient_id, duration, stage (for bar fill)
  # The event data is often separate.
  
  # For this standard template, let's assume `data_payload` is the BARS data,
  # and `event_payload` (optional) is the POINTS data. 
  # OR `data_payload` has complex structure. 
  # Let's flatten: data_payload is Bars. Events keys are embedded or separate?
  # Simplified MVP: Data Payload = Bars only.
  
  df_bars <- parse_data_payload(config_list$data_payload)
  style <- config_list$style_config
  
  # Sort patients by duration if requested
  if (is.null(style$sort) || style$sort) {
    df_bars <- df_bars[order(df_bars$duration), ]
    df_bars$patient_id <- factor(df_bars$patient_id, levels = df_bars$patient_id)
  }
  
  p <- ggplot(df_bars, aes(x = patient_id, y = duration, fill = stage)) +
    geom_bar(stat = "identity", width = 0.8) +
    coord_flip() + # Horizontal bars (Swimmer)
    
    scale_y_continuous(expand = c(0,0)) +
    labs(x = "Patient ID", y = "Months since start", fill = "Treatment Stage") +
    
    get_journal_theme("NEJM")
  
  # If validation passed events, we would add:
  # geom_point(data=events, aes(x=patient, y=time, shape=event_type))
  
  return(p)
}
