#' IO Utilities for SciDigitizeR
#' 
#' Handles JSON input parsing and basic validation.
#' Dependencies: jsonlite

library(jsonlite)

#' Read Chart Configuration
#'
#' Parsers a JSON file or string into an R list object.
#' 
#' @param input_source Path to a JSON file or a JSON string.
#' @return A named list containing the chart configuration.
#' @export
read_chart_config <- function(input_source) {
  # Check if input is a file path
  if (file.exists(input_source)) {
    config <- fromJSON(input_source, simplifyVector = FALSE)
  } else {
    # Assume it's a JSON string
    config <- fromJSON(input_source, simplifyVector = FALSE)
  }
  return(config)
}

#' Validate Configuration
#'
#' Checks if the configuration object contains required top-level keys.
#'
#' @param config The configuration list object.
#' @param required_keys Vector of strings representing required keys.
#' @return TRUE if valid, stops with error otherwise.
#' @export
validate_config <- function(config, required_keys = c("chart_type", "style_config", "data_payload")) {
  missing_keys <- setdiff(required_keys, names(config))
  
  if (length(missing_keys) > 0) {
    stop(paste("Invalid Configuration. Missing required keys:", paste(missing_keys, collapse = ", ")))
  }
  
  return(TRUE)
}

#' Standardize Data Frame
#' 
#' Converts the 'data_payload' list from JSON into a standard R data.frame.
#' Handles type conversion (e.g., ensuring numeric columns are actually numeric).
#'
#' @param data_payload List object from the JSON config.
#' @return A standard data.frame.
#' @export
parse_data_payload <- function(data_payload) {
  # jsonlite::fromJSON usually handles this well, but if we used simplifyVector=FALSE
  # we might have a list of lists.
  
  # If it's already a data frame (from simplifyVector=TRUE context), just return
  if (is.data.frame(data_payload)) return(data_payload)
  
  # Parse list of lists to data frame
  # This assumes data_payload is a list of row objects or column vectors
  # For simplicity, we assume column vectors for now as it's more R-like, 
  # or list of row objects which is more JSON-like.
  
  # Standard JSON "Table" format usually is array of objects: [{"time": 10, "status": 1}, ...]
  df <- do.call(rbind, lapply(data_payload, as.data.frame))
  return(df)
}
