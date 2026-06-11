/**
 * Entity representing a user's bet.
 */
class Bet {
  /**
   * Initialize a Bet instance.
   *
   * @param {string} user - The name of the user.
   * @param {string} match - The match description (e.g., 'Brazil vs Serbia').
   * @param {number} teamAScore - Predicted score for Team A.
   * @param {number} teamBScore - Predicted score for Team B.
   */
  constructor(user, match, teamAScore, teamBScore) {
    this.user = user;
    this.match = match;
    this.teamAScore = teamAScore;
    this.teamBScore = teamBScore;
  }
}

/**
 * Infrastructure layer: Handles Google Sheets operations.
 */
class SpreadsheetRepository {
  /**
   * Initialize the SpreadsheetRepository.
   * Creates the sheet and headers if they do not exist.
   *
   * @param {string} sheetName - The name of the worksheet to operate on.
   */
  constructor(sheetName) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    this.sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!this.sheet) {
      this.sheet = spreadsheet.insertSheet(sheetName);
      this.sheet.appendRow(["Timestamp", "User", "Match", "Team A Score", "Team B Score"]);
      this.sheet.getRange("A1:E1").setFontWeight("bold");
    }
  }

  /**
   * Save a new bet into the database.
   *
   * @param {Bet} bet - The bet entity to save.
   */
  saveBet(bet) {
    this.sheet.appendRow([
      new Date(),
      bet.user,
      bet.match,
      bet.teamAScore,
      bet.teamBScore
    ]);
  }
}

/**
 * Use Case layer: Business logic for processing a bet.
 */
class SubmitBetUseCase {
  /**
   * Initialize SubmitBetUseCase with required repositories.
   *
   * @param {SpreadsheetRepository} betRepository - Repository for bets.
   */
  constructor(betRepository) {
    this.betRepository = betRepository;
  }

  /**
   * Execute the use case to register a bet.
   * Validates the input before saving.
   *
   * @param {object} betData - Raw bet data from the controller.
   * @throws {Error} If the data is invalid.
   */
  execute(betData) {
    const scoreA = parseInt(betData.teamAScore, 10);
    const scoreB = parseInt(betData.teamBScore, 10);

    if (isNaN(scoreA) || isNaN(scoreB) || scoreA < 0 || scoreB < 0) {
      throw new Error("Scores must be valid positive numbers.");
    }
    if (!betData.user || betData.user.trim() === "") {
      throw new Error("User name is required.");
    }

    const bet = new Bet(
      betData.user,
      betData.match,
      scoreA,
      scoreB
    );
    
    this.betRepository.saveBet(bet);
  }
}

/**
 * Controller layer: Entry point for rendering the Web App interface.
 *
 * @param {GoogleAppsScript.Events.DoGet} e - The GET event object.
 * @returns {GoogleAppsScript.HTML.HtmlOutput} The rendered HTML page.
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Bolão da Copa')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Controller layer: Entry point for the frontend to submit a bet.
 * This function is called via google.script.run from the client side.
 *
 * @param {object} betData - Raw bet data from the frontend form.
 * @returns {string} JSON string indicating success or failure.
 */
function submitBetController(betData) {
  try {
    const betRepo = new SpreadsheetRepository("Palpites");
    const useCase = new SubmitBetUseCase(betRepo);

    useCase.execute(betData);

    return JSON.stringify({ status: "success", message: "Palpite registrado com sucesso!" });
  } catch (error) {
    return JSON.stringify({ status: "error", message: error.message });
  }
}