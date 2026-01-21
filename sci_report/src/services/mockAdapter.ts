import { MOCK_CELL_DATA } from './mock/cell.mock';
import { MOCK_STUDY_SECTIONS } from './mock/study.mock';

export class MockService {
    private static instance: MockService;

    private constructor() { }

    public static getInstance(): MockService {
        if (!MockService.instance) {
            MockService.instance = new MockService();
        }
        return MockService.instance;
    }

    // Simulate slight network delay
    private async delay(ms: number = 300): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async getStudySections(studyId: string) {
        await this.delay();
        console.log(`[Mock] Fetching sections for study: ${studyId}`);
        return MOCK_STUDY_SECTIONS;
    }

    public async getCellDetail(studyId: string, cellId: string) {
        await this.delay();
        console.log(`[Mock] Fetching detail for cell: ${cellId} in study: ${studyId}`);
        return MOCK_CELL_DATA;
    }
}

export const mockService = MockService.getInstance();
